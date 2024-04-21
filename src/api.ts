import { Bracket, Region } from "./getRankings"
import { and, eq, isNotNull } from "drizzle-orm"
import { db } from "./db"
import express from "express"
import { players } from "./db/players"

const PORT = process.env.PORT || 3000
const app = express()

app.get("/", (_req, res) => {
  res.send("Hello World")
})

app.get("/queue/:bracket?/:region?", async (req, res) => {
  const { bracket = Bracket.Singles, region = Region.US_East } = req.params

  try {
    const queue = await db
      .select()
      .from(players)
      .where(
        and(
          eq(players.bracket, bracket),
          eq(players.region, region),
          isNotNull(players.still_queuing_at),
        ),
      )

    res.status(200).json(queue.map(({ id, ...player }) => player))
  } catch {
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.listen(PORT, () => {
  console.log("🚀 - Server ready")
})
