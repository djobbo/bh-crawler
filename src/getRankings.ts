import { HttpClient } from "@effect/platform"
import { Schema as S } from "@effect/schema"
import { Effect, Schedule } from "effect"
import { API } from "./context/api"
import { Context } from "effect"

export enum Bracket {
  Singles = "1v1",
  Doubles = "2v2",
  Seasonal = "rotating",
}

export enum Region {
  US_East = "us-e",
  US_West = "us-w",
  Europe = "eu",
}

export class RankingsContext extends Context.Tag("RankingsContext")<
  RankingsContext,
  {
    readonly bracket: Bracket
    readonly region: Region
    readonly page: number
  }
>() {}

const retryPolicy = Schedule.exponential(1000).pipe(
    Schedule.compose(Schedule.recurs(3)),
  ),
  httpCall = Effect.gen(function* (_) {
    const api = yield* _(API),
      { bracket, region, page } = yield* _(RankingsContext)

    return yield* _(
      HttpClient.request
        .get(
          `${api.baseUrl}/rankings/${bracket}/${region}/${page}?api_key=${api.key}`,
        )
        .pipe(HttpClient.client.fetchOk, HttpClient.response.json),
    )
  })

export enum Tier {
  Valhallan = "Valhallan",
  Diamond = "Diamond",
  Platinum = "Platinum",
  Gold = "Gold",
  Silver = "Silver",
  Bronze = "Bronze",
  Tin = "Tin",
}

const rankingSchema = S.Struct({
  rank: S.Number,
  name: S.String,
  brawlhalla_id: S.Number,
  best_legend: S.Number,
  best_legend_games: S.Number,
  best_legend_wins: S.Number,
  rating: S.Number,
  tier: S.Enums(Tier),
  games: S.Number,
  wins: S.Number,
  region: S.String,
  peak_rating: S.Number,
})

export type Ranking = S.Schema.Type<typeof rankingSchema>

const rankingsSchema = S.Array(rankingSchema)

export const getRankings = Effect.gen(function* (_) {
  const { bracket, region, page } = yield* _(RankingsContext)

  return yield* _(
    httpCall.pipe(
      Effect.timeout("3 seconds"),
      Effect.retry(retryPolicy),
      Effect.flatMap(S.decodeUnknown(rankingsSchema)),
      Effect.withSpan("getRankings", {
        attributes: { bracket, region, page },
      }),
    ),
  )
})
