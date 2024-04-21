import { drizzle } from "drizzle-orm/bun-sqlite"
import { migrate } from "drizzle-orm/bun-sqlite/migrator"
import { Database } from "bun:sqlite"
const sqlite = new Database("db.db"),
  db = drizzle(sqlite)

migrate(db, { migrationsFolder: ".drizzle" })

export { db }
