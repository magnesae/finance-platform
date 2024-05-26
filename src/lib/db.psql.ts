import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sessions, users } from "@/db/schema";

// const sqlite = new Database("sqlite.db");
// export const db = drizzle(sqlite);

const pool = new pg.Pool();
const db = drizzle(pool);

export const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
export interface DatabaseUser {
  id: string;
  username: string;
  password: string;
}
