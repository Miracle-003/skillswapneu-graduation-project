import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma 7 requires connection URLs in prisma.config.ts.
    // Default to an empty string so Prisma can surface a clear validation error
    // instead of crashing if DATABASE_URL isn't set in the environment.
    url: process.env.DATABASE_URL ?? "",
  },
});

