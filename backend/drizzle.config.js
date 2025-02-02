import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();
export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql", // 'postgresql' | 'mysql' | 'sqlite'http`(WIP) or `expo` are used
    dbCredentials: {
        url: process.env.DATABASE_URL || "",
    },
});
