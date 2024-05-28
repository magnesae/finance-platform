import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// import { sessionTable, userTable } from "@/lib/db/schema";

const sqlite = new Database("sqlite.db");

export const db = drizzle(sqlite);

// Have to define here because importing from another file causes error
export const users = sqliteTable("users", {
  id: text("id").notNull().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});

export const adapter = new DrizzleSQLiteAdapter(db, sessions, users);
export interface DatabaseUser {
  id: string;
  username: string;
  password: string;
}
