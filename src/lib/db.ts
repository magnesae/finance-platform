import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
// import { sessionTable, userTable } from "@/lib/db/schema";

const sqlite = new Database("sqlite.db");

export const db = drizzle(sqlite);

// Have to define here because importing from another file causes error
export const userTable = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

export const adapter = new DrizzleSQLiteAdapter(db, sessionTable, userTable);
export interface DatabaseUser {
  id: string;
  username: string;
  password: string;
}
