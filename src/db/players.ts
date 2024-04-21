import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  brawlhalla_id: integer("brawlhalla_id").notNull(),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  old_rank: integer("old_rank"),
  rank: integer("rank").notNull(),
  rating: integer("rating").notNull(),
  old_rating: integer("old_rating"),
  peak_rating: integer("peak_rating").notNull(),
  games: integer("games").notNull(),
  wins: integer("wins").notNull(),
  // TODO: types for bracket and region
  bracket: text("bracket").notNull(),
  region: text("region").notNull(),
  updated_at: text("updated_at").notNull(),
  queuing_since: text("queuing_since"),
  still_queuing_at: text("still_queuing_at"),
})

export type Player = InferSelectModel<typeof players>
export type NewPlayer = InferInsertModel<typeof players>
