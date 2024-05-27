import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { categories, insertCategorySchema } from "@/db/schema";
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
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.userId, user.id));

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
          id: categories.id,
          name: categories.name,
        })
        .from(categories)
        .where(and(eq(categories.userId, user.id), eq(categories.id, id)));

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
      insertCategorySchema.pick({
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
        .insert(categories)
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
        .delete(categories)
        .where(
          and(
            eq(categories.userId, user.id),
            inArray(categories.id, values.ids),
          ),
        )
        .returning({
          id: categories.id,
        });

      return c.json({ data });
    },
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator(
      "json",
      insertCategorySchema.pick({
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
        .update(categories)
        .set(values)
        .where(and(eq(categories.userId, user.id), eq(categories.id, id)))
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
        .delete(categories)
        .where(and(eq(categories.userId, user.id), eq(categories.id, id)))
        .returning({ id: categories.id });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    },
  );

export default app;
