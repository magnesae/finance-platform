import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";
import { validateRequest } from "@/lib/auth";
import { and, eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

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
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { user } = await validateRequest();
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db
        .select({
          id: accounts.id,
          name: accounts.name,
        })
        .from(accounts)
        .where(and(eq(accounts.userId, user.id), eq(accounts.id, id)));

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  )
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
  )
  .post(
    "/bulk-delete",
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const { user } = await validateRequest();
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const values = c.req.valid("json");

      const data = await db
        .delete(accounts)
        .where(
          and(eq(accounts.userId, user.id), inArray(accounts.id, values.ids)),
        )
        .returning({
          id: accounts.id,
        });

      return c.json({ data });
    },
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
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

      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db
        .update(accounts)
        .set(values)
        .where(and(eq(accounts.userId, user.id), eq(accounts.id, id)))
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  )
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const { user } = await validateRequest();
      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db
        .delete(accounts)
        .where(and(eq(accounts.userId, user.id), eq(accounts.id, id)))
        .returning({ id: accounts.id });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  );

export default app;
