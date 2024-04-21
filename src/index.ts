import { Context, Effect } from "effect"
import { Bracket, Region } from "./getRankings"
import { API } from "./context/api"
import { config } from "dotenv"
import { Crawler } from "./context/crawler"
import { crawler } from "./crawler"
import "./api"

config({ path: ".env" })

const { BRAWLHALLA_API_KEY } = process.env

if (!BRAWLHALLA_API_KEY) {
  throw new Error("Missing BRAWLHALLA_API_KEY")
}

const crawlerService: Crawler["Type"] = {
    crawlerInterval: 5 * 60 * 1000,
    fetchInterval: 5 * 1000,
    regions: {
      [Region.Europe]: {
        [Bracket.Singles]: {
          maxPages: 10,
        },
      },
      [Region.US_East]: {
        [Bracket.Singles]: {
          maxPages: 10,
        },
      },
    },
  },
  crawlerServiceDev: Crawler["Type"] = {
    crawlerInterval: 30 * 1000,
    fetchInterval: 2.5 * 1000,
    regions: {
      [Region.US_East]: {
        [Bracket.Singles]: {
          maxPages: 10,
        },
      },
    },
  },
  context = Context.empty().pipe(
    Context.add(API, {
      baseUrl: "https://api.brawlhalla.com",
      key: BRAWLHALLA_API_KEY,
    }),
    Context.add(
      Crawler,
      Bun.env.NODE_ENV === "production" ? crawlerService : crawlerServiceDev,
    ),
  ),
  runnable = Effect.provide(crawler, context)

Effect.runFork(runnable)
