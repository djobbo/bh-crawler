import { Duration, Effect, Schedule } from "effect"
import { Bracket, RankingsContext, Region, getRankings } from "./getRankings"
import { db } from "./db"
import { and, eq, sql } from "drizzle-orm"
import { players } from "./db/schema"
import { Crawler } from "./context/crawler"
import { updatePlayer } from "./updatePlayer"

const fetchRankings = Effect.gen(function* (_) {
  const { region, bracket, page } = yield* _(RankingsContext)
  console.log(`🤔 - Fetching rankings for ${bracket} ${region} page ${page}`)

  const rankings = yield* _(getRankings),
    storedRankings = yield* _(
      Effect.promise(() =>
        db
          .select()
          .from(players)
          .where(and(eq(players.bracket, bracket), eq(players.region, region))),
      ),
    ),
    /*
     * Reduce the rankings to only include players which are not already stored or have a different rating
     * add a prop to the rankings to indicate if the player is new or has a different rating (- or +)
     */
    queue = yield* _(
      Effect.all(
        rankings.map((ranking) => updatePlayer(storedRankings, ranking)),
      ),
    )

  // Update the players table with the new rankings
  yield* _(
    Effect.promise(() =>
      db
        .insert(players)
        .values(queue)
        .onConflictDoUpdate({
          target: players.id,
          set: {
            name: sql`excluded.name`,
            tier: sql`excluded.tier`,
            rank: sql`excluded.rank`,
            old_rank: sql`excluded.old_rank`,
            rating: sql`excluded.rating`,
            old_rating: sql`excluded.old_rating`,
            peak_rating: sql`excluded.peak_rating`,
            games: sql`excluded.games`,
            wins: sql`excluded.wins`,
            updated_at: sql`excluded.updated_at`,
            queuing_since: sql`excluded.queuing_since`,
            still_queuing_at: sql`excluded.still_queuing_at`,
          },
        }),
    ),
  )

  // Delete players from the players table that weren't updated in a long time (30 minutes)
  yield* _(
    Effect.promise(() =>
      db
        .delete(players)
        .where(
          and(
            eq(players.bracket, bracket),
            eq(players.region, region),
            sql`updated_at < datetime('now', '-30 minutes')`,
          ),
        ),
    ),
  )

  console.log(`👍 - Fetched rankings for ${region} ${bracket}`)

  return rankings
})

export const crawler = Effect.gen(function* (_) {
  const { crawlerInterval, fetchInterval, regions } = yield* _(Crawler)

  yield* _(
    Effect.repeat(
      Effect.forEach(Object.entries(regions), ([region, bracket]) =>
        Effect.forEach(Object.entries(bracket), ([bracket, { maxPages }]) =>
          Effect.loop(1, {
            while: (page) => page <= maxPages,
            step: (page) => page + 1,
            body: (page) =>
              Effect.delay(
                fetchRankings.pipe(
                  Effect.provideService(RankingsContext, {
                    bracket: bracket as Bracket,
                    region: region as Region,
                    page,
                  }),
                ),
                Duration.millis(fetchInterval),
              ),
          }),
        ),
      ),
      Schedule.spaced(Duration.millis(crawlerInterval)),
    ),
  )
})
