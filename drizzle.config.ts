import process from "node:process";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: "postgresql",
    schema: "./shared/db/schema.ts",
    out: "./drizzle",
    schemaFilter: ["public"],
    verbose: true,
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
