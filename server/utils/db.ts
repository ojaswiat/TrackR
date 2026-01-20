import process from "node:process";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "~~/shared/db/schema";

export const db = drizzle(process.env.DATABASE_URL!, { schema });
