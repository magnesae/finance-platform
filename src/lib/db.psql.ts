import { sessions, users } from "@/db/schema";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// const sqlite = new Database("sqlite.db");
// export const db = drizzle(sqlite);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const db = drizzle(pool);

export const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
export interface DatabaseUser {
  id: string;
  username: string;
  password: string;
}
