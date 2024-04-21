import { beforeEach, describe, expect, it, setSystemTime } from "bun:test"
import { updatePlayer } from "./updatePlayer"
import type { Player } from "./db/players"
import {
  Bracket,
  type Ranking,
  RankingsContext,
  Region,
  Tier,
} from "./getRankings"
import { Effect } from "effect"

describe("updatePlayer", () => {
  beforeEach(() => {
    setSystemTime(new Date("1999-11-03T00:00:00.000Z"))
  })

  it("should return the player without any changes if the player is not yet stored", () => {
    // Arrange
    const storedPlayers: Player[] = [],
      ranking: Ranking = {
        brawlhalla_id: 1,
        name: "Player1",
        tier: Tier.Valhallan,
        rank: 1,
        rating: 1000,
        peak_rating: 1000,
        region: "US-E",
        games: 1,
        wins: 1,
        best_legend: 1,
        best_legend_games: 1,
        best_legend_wins: 1,
      },
      // Act
      result = Effect.runSync(
        updatePlayer(storedPlayers, ranking).pipe(
          Effect.provideService(RankingsContext, {
            bracket: Bracket.Singles,
            region: Region.US_East,
            page: 1,
          }),
        ),
      )

    // Assert
    expect(result).toEqual({
      id: "1-1v1-us-e",
      brawlhalla_id: 1,
      name: "Player1",
      tier: Tier.Valhallan,
      rank: 1,
      old_rank: null,
      rating: 1000,
      old_rating: null,
      peak_rating: 1000,
      bracket: Bracket.Singles,
      region: Region.US_East,
      games: 1,
      wins: 1,
      updated_at: "1999-11-03T00:00:00.000Z",
      queuing_since: null,
      still_queuing_at: null,
    })
  })

  it("should update an existing player if it is stored", () => {
    // Arrange
    const storedPlayers: Player[] = [
        {
          id: "1-1v1-eu",
          brawlhalla_id: 1,
          name: "Player1",
          tier: "Diamond",
          rank: 1,
          old_rank: null,
          rating: 1000,
          old_rating: null,
          peak_rating: 1000,
          bracket: Bracket.Singles,
          region: Region.Europe,
          games: 1,
          wins: 1,
          updated_at: "1999-11-03T00:00:00.000Z",
          queuing_since: null,
          still_queuing_at: null,
        },
      ],
      ranking: Ranking = {
        brawlhalla_id: 1,
        name: "My new awesome name",
        tier: Tier.Valhallan,
        rank: 1,
        rating: 1000,
        peak_rating: 1000,
        region: "EU",
        games: 1,
        wins: 1,
        best_legend: 1,
        best_legend_games: 1,
        best_legend_wins: 1,
      },
      // Act
      result = Effect.runSync(
        updatePlayer(storedPlayers, ranking).pipe(
          Effect.provideService(RankingsContext, {
            bracket: Bracket.Singles,
            region: Region.US_East,
            page: 1,
          }),
        ),
      )

    // Assert
    expect(result).toEqual({
      id: "1-1v1-us-e",
      brawlhalla_id: 1,
      name: "My new awesome name",
      tier: Tier.Valhallan,
      rank: 1,
      old_rank: null,
      rating: 1000,
      old_rating: null,
      peak_rating: 1000,
      bracket: Bracket.Singles,
      region: Region.Europe,
      games: 1,
      wins: 1,
      updated_at: "1999-11-03T00:00:00.000Z",
      queuing_since: null,
      still_queuing_at: null,
    })
  })

  it("should start queue if number of games changed", () => {
    // Arrange
    const storedPlayers: Player[] = [
        {
          id: "1-1v1-us-e",
          brawlhalla_id: 1,
          name: "Player1",
          tier: "Silver",
          rank: 1,
          old_rank: null,
          rating: 1200,
          old_rating: null,
          peak_rating: 1800,
          bracket: Bracket.Singles,
          region: Region.US_East,
          games: 1,
          wins: 1,
          updated_at: "1999-11-03T00:00:00.000Z",
          queuing_since: null,
          still_queuing_at: null,
        },
      ],
      ranking: Ranking = {
        brawlhalla_id: 1,
        name: "Player1",
        tier: Tier.Silver,
        rank: 1,
        rating: 1400,
        peak_rating: 1800,
        region: "US-E",
        games: 2,
        wins: 2,
        best_legend: 1,
        best_legend_games: 1,
        best_legend_wins: 1,
      },
      // Act
      result = Effect.runSync(
        updatePlayer(storedPlayers, ranking).pipe(
          Effect.provideService(RankingsContext, {
            bracket: Bracket.Singles,
            region: Region.US_East,
            page: 1,
          }),
        ),
      )

    // Assert
    expect(result).toEqual({
      id: "1-1v1-us-e",
      brawlhalla_id: 1,
      name: "Player1",
      tier: Tier.Silver,
      rank: 1,
      old_rank: 1,
      rating: 1400,
      old_rating: 1200,
      peak_rating: 1800,
      bracket: Bracket.Singles,
      region: Region.US_East,
      games: 2,
      wins: 2,
      updated_at: "1999-11-03T00:00:00.000Z",
      queuing_since: "1999-11-03T00:00:00.000Z",
      still_queuing_at: "1999-11-03T00:00:00.000Z",
    })
  })

  it("should keep the player in queue if number of games changed", () => {
    // Arrange
    const storedPlayers: Player[] = [
      {
        id: "1-1v1-us-e",
        brawlhalla_id: 1,
        name: "Player1",
        tier: "Silver",
        rank: 1,
        old_rank: 2,
        rating: 1200,
        old_rating: 1000,
        peak_rating: 1800,
        bracket: Bracket.Singles,
        region: Region.US_East,
        games: 1,
        wins: 1,
        updated_at: "1999-11-03T00:00:00.000Z",
        queuing_since: "1999-11-03T00:00:00.000Z",
        still_queuing_at: "1999-11-03T00:00:00.000Z",
      },
    ]

    setSystemTime(new Date("1999-11-03T00:15:00.000Z"))

    const ranking: Ranking = {
        brawlhalla_id: 1,
        name: "Player1",
        tier: Tier.Silver,
        rank: 1,
        rating: 1400,
        peak_rating: 1800,
        region: "US-E",
        games: 2,
        wins: 2,
        best_legend: 1,
        best_legend_games: 1,
        best_legend_wins: 1,
      },
      // Act
      result = Effect.runSync(
        updatePlayer(storedPlayers, ranking).pipe(
          Effect.provideService(RankingsContext, {
            bracket: Bracket.Singles,
            region: Region.US_East,
            page: 1,
          }),
        ),
      )

    // Assert
    expect(result).toEqual({
      id: "1-1v1-us-e",
      brawlhalla_id: 1,
      name: "Player1",
      tier: Tier.Silver,
      rank: 1,
      old_rank: 2,
      rating: 1400,
      old_rating: 1000,
      peak_rating: 1800,
      bracket: Bracket.Singles,
      region: Region.US_East,
      games: 2,
      wins: 2,
      updated_at: "1999-11-03T00:15:00.000Z",
      queuing_since: "1999-11-03T00:00:00.000Z",
      still_queuing_at: "1999-11-03T00:15:00.000Z",
    })
  })

  it("should keep the player in queue if number of games changed and update old rank and old rating if they were null", () => {
    // Arrange
    const storedPlayers: Player[] = [
      {
        id: "1-1v1-us-e",
        brawlhalla_id: 1,
        name: "Player1",
        tier: "Silver",
        rank: 1,
        old_rank: null,
        rating: 1200,
        old_rating: null,
        peak_rating: 1800,
        bracket: Bracket.Singles,
        region: Region.US_East,
        games: 1,
        wins: 1,
        updated_at: "1999-11-03T00:00:00.000Z",
        queuing_since: "1999-11-03T00:00:00.000Z",
        still_queuing_at: "1999-11-03T00:00:00.000Z",
      },
    ]

    setSystemTime(new Date("1999-11-03T00:15:00.000Z"))

    const ranking: Ranking = {
        brawlhalla_id: 1,
        name: "Player1",
        tier: Tier.Silver,
        rank: 1,
        rating: 1400,
        peak_rating: 1800,
        region: "US-E",
        games: 2,
        wins: 2,
        best_legend: 1,
        best_legend_games: 1,
        best_legend_wins: 1,
      },
      // Act
      result = Effect.runSync(
        updatePlayer(storedPlayers, ranking).pipe(
          Effect.provideService(RankingsContext, {
            bracket: Bracket.Singles,
            region: Region.US_East,
            page: 1,
          }),
        ),
      )

    // Assert
    expect(result).toEqual({
      id: "1-1v1-us-e",
      brawlhalla_id: 1,
      name: "Player1",
      tier: Tier.Silver,
      rank: 1,
      old_rank: 1,
      rating: 1400,
      old_rating: 1200,
      peak_rating: 1800,
      bracket: Bracket.Singles,
      region: Region.US_East,
      games: 2,
      wins: 2,
      updated_at: "1999-11-03T00:15:00.000Z",
      queuing_since: "1999-11-03T00:00:00.000Z",
      still_queuing_at: "1999-11-03T00:15:00.000Z",
    })
  })

  it("should remove the player from the queue if the number of games did not change and it's been more than 30 minutes", () => {
    // Arrange
    const storedPlayers: Player[] = [
      {
        id: "1-1v1-us-e",
        brawlhalla_id: 1,
        name: "Player1",
        tier: "Silver",
        rank: 1,
        old_rank: null,
        rating: 1200,
        old_rating: null,
        peak_rating: 1800,
        bracket: Bracket.Singles,
        region: Region.US_East,
        games: 1,
        wins: 1,
        updated_at: "1999-11-03T00:00:00.000Z",
        queuing_since: "1999-11-03T00:00:00.000Z",
        still_queuing_at: "1999-11-03T00:00:00.000Z",
      },
    ]

    setSystemTime(new Date("1999-11-03T12:00:00.000Z"))

    const ranking: Ranking = {
        brawlhalla_id: 1,
        name: "Player1",
        tier: Tier.Silver,
        rank: 1,
        rating: 1400,
        peak_rating: 1800,
        region: "US-E",
        games: 1,
        wins: 1,
        best_legend: 1,
        best_legend_games: 1,
        best_legend_wins: 1,
      },
      // Act
      result = Effect.runSync(
        updatePlayer(storedPlayers, ranking).pipe(
          Effect.provideService(RankingsContext, {
            bracket: Bracket.Singles,
            region: Region.US_East,
            page: 1,
          }),
        ),
      )

    // Assert
    expect(result).toEqual({
      id: "1-1v1-us-e",
      brawlhalla_id: 1,
      name: "Player1",
      tier: Tier.Silver,
      rank: 1,
      old_rank: null,
      rating: 1400,
      old_rating: null,
      peak_rating: 1800,
      bracket: Bracket.Singles,
      region: Region.US_East,
      games: 1,
      wins: 1,
      updated_at: "1999-11-03T12:00:00.000Z",
      queuing_since: null,
      still_queuing_at: null,
    })
  })

  it("should keep the player in queue if number of games changed even if it's been more than 30 minutes", () => {
    // Arrange
    const storedPlayers: Player[] = [
      {
        id: "1-1v1-us-e",
        brawlhalla_id: 1,
        name: "Player1",
        tier: "Silver",
        rank: 1,
        old_rank: null,
        rating: 1200,
        old_rating: null,
        peak_rating: 1800,
        bracket: Bracket.Singles,
        region: Region.US_East,
        games: 1,
        wins: 1,
        updated_at: "1999-11-03T00:00:00.000Z",
        queuing_since: "1999-11-03T00:00:00.000Z",
        still_queuing_at: "1999-11-03T00:00:00.000Z",
      },
    ]

    setSystemTime(new Date("1999-11-03T12:00:00.000Z"))

    const ranking: Ranking = {
        brawlhalla_id: 1,
        name: "Player1",
        tier: Tier.Silver,
        rank: 1,
        rating: 1400,
        peak_rating: 1800,
        region: "US-E",
        games: 2,
        wins: 2,
        best_legend: 1,
        best_legend_games: 1,
        best_legend_wins: 1,
      },
      // Act
      result = Effect.runSync(
        updatePlayer(storedPlayers, ranking).pipe(
          Effect.provideService(RankingsContext, {
            bracket: Bracket.Singles,
            region: Region.US_East,
            page: 1,
          }),
        ),
      )

    // Assert
    expect(result).toEqual({
      id: "1-1v1-us-e",
      brawlhalla_id: 1,
      name: "Player1",
      tier: Tier.Silver,
      rank: 1,
      old_rank: 1,
      rating: 1400,
      old_rating: 1200,
      peak_rating: 1800,
      bracket: Bracket.Singles,
      region: Region.US_East,
      games: 2,
      wins: 2,
      updated_at: "1999-11-03T12:00:00.000Z",
      queuing_since: "1999-11-03T00:00:00.000Z",
      still_queuing_at: "1999-11-03T12:00:00.000Z",
    })
  })
})
