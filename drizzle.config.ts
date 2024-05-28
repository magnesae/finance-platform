// import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

// config({ path: '.env.local' });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
  verbose: true,
  strict: true,
});
