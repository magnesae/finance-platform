import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";
import { validateRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono()
  .get("/", async (c) => {
    const { user } = await validateRequest();
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const data = await db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(eq(accounts.userId, user.id));

    return c.json({ data });
  })
  .post(
    "/",
    zValidator(
      "json",
      insertAccountSchema.pick({
        name: true,
      }),
    ),
    async (c) => {
      const { user } = await validateRequest();
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const values = c.req.valid("json");

      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: user.id,
          ...values,
        })
        .returning();

      return c.json({ data });
    },
  );

export default app;
