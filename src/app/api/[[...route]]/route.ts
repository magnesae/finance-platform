import { Hono } from "hono";
import { handle } from "hono/vercel";
import accounts from "@/app/api/[[...route]]/accounts";

// export const runtime = 'edge';

const app = new Hono().basePath("/api");

const routes = app.route("/accounts", accounts);

// app
//   .get("/hello", async (c) => {
//     const { user } = await validateRequest();
//     if (!user) {
//       return c.json({
//         error: "Unauthorized",
//       });
//     }

//     return c.json({
//       message: "Hello Next.js!",
//       user: user,
//     });
//   })
//   .get(
//     "/hello/:test",
//     zValidator(
//       "param",
//       z.object({
//         test: z.string(),
//       }),
//     ),
//     (c) => {
//       const { test } = c.req.valid("param");

//       return c.json({
//         message: "World Next.js!",
//         test: test,
//       });
//     },
//   );

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
