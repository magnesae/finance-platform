import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { validateRequest } from '@/lib/auth';

// export const runtime = 'edge';

const app = new Hono().basePath('/api');

app
  .get('/hello', async (c) => {
    const { user } = await validateRequest();
    if (!user) {
      return c.json({
        error: 'Unauthorized',
      });
    }

    return c.json({
      message: 'Hello Next.js!',
      user: user,
    });
  })
  .get(
    '/hello/:test',
    zValidator(
      'param',
      z.object({
        test: z.string(),
      }),
    ),
    (c) => {
      const { test } = c.req.valid('param');

      return c.json({
        message: 'World Next.js!',
        test: test,
      });
    },
  );

export const GET = handle(app);
export const POST = handle(app);
