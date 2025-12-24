import { defineConfig } from "prisma/config"

export default defineConfig({
  migrate: {
    datasource: "db",
  },
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_URL,
    },
  },
})
