import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

dotenv.config();

const client = new pg.Client({
	connectionString: process.env.DATABASE_URL,
});

client.connect();
// const db = drizzle(client);
export const db = drizzle(client, { schema: schema });
