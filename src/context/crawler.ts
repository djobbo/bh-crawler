import { Context } from "effect"
import type { Bracket, Region } from "../getRankings"

export class Crawler extends Context.Tag("Crawler")<
  Crawler,
  {
    /**
     * The interval in milliseconds to run the crawler
     */
    readonly crawlerInterval: number
    /**
     * The interval in milliseconds to fetch the rankings
     */
    readonly fetchInterval: number
    readonly regions: {
      [key in Region]?: {
        [key in Bracket]?: {
          maxPages: number
        }
      }
    }
  }
>() {}
