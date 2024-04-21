import type { Config } from "drizzle-kit"

export default {
  schema: "./src/db/schema.ts",
  out: "./.drizzle",
  dbCredentials: {
    url: "file:./db.db",
  },
} satisfies Config
