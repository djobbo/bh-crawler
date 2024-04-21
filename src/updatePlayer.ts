import { Effect } from "effect"
import { type Ranking, RankingsContext } from "./getRankings"
import type { NewPlayer, Player } from "./db/schema"

const getPlayerPrimaryKey = ({
  brawlhalla_id,
  bracket,
  region,
}: Pick<NewPlayer, "brawlhalla_id" | "bracket" | "region">) =>
  `${brawlhalla_id}-${bracket}-${region}`

export const updatePlayer = (storedPlayers: Player[], ranking: Ranking) =>
  Effect.gen(function* (_) {
    const { bracket, region } = yield* _(RankingsContext),
      id = getPlayerPrimaryKey({
        brawlhalla_id: ranking.brawlhalla_id,
        bracket,
        region,
      }),
      storedPlayer = storedPlayers.find((r) => r.id === id),
      wasQueuing =
        Boolean(storedPlayer) && Boolean(storedPlayer.still_queuing_at),
      isQueuing =
        Boolean(storedPlayer) &&
        (storedPlayer.games !== ranking.games ||
          (Boolean(storedPlayer.still_queuing_at) &&
            new Date(storedPlayer.still_queuing_at) >
              new Date(Date.now() - 30 * 60 * 1000))),
      startedQueuing = !wasQueuing && isQueuing,
      now = new Date().toISOString(),
      newPlayer: NewPlayer = {
        ...storedPlayer,
        id,
        brawlhalla_id: ranking.brawlhalla_id,
        name: ranking.name,
        tier: ranking.tier,
        rank: ranking.rank,
        rating: ranking.rating,
        peak_rating: ranking.peak_rating,
        bracket,
        region: ranking.region.toLowerCase(),
        games: ranking.games,
        wins: ranking.wins,
        updated_at: now,
        ...(startedQueuing && {
          old_rank: storedPlayer.rank,
          old_rating: storedPlayer.rating,
          queuing_since: now,
        }),
        ...(isQueuing
          ? {
              still_queuing_at: now,
              old_rank: storedPlayer?.old_rank ?? storedPlayer?.rank ?? null,
              old_rating:
                storedPlayer?.old_rating ?? storedPlayer?.rating ?? null,
              queuing_since: storedPlayer?.queuing_since ?? now ?? null,
            }
          : {
              still_queuing_at: null,
              old_rank: null,
              old_rating: null,
              queuing_since: null,
            }),
      }

    return newPlayer
  })
