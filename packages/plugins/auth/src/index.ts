import { Plugin, PluginContext } from '@express-tool/core';

export const authMiddlewareTs = `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

interface UserPayload {
  id: string;
  email: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user as UserPayload;
    next();
  });
};
`;

export const authMiddlewareJs = `import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
`;

export const authRouterTs = `import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post('/login', (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  // In a real app, verify credentials against DB
  const user = { id: '1', email: result.data.email };
  
  const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

  res.json({ accessToken, refreshToken });
});
`;

export const authRouterJs = `import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

authRouter.post('/login', (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  // In a real app, verify credentials against DB
  const user = { id: '1', email: result.data.email };
  
  const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

  res.json({ accessToken, refreshToken });
});
`;

export const authPlugin: Plugin = {
  name: 'auth',
  apply: async (context: PluginContext) => {
    const { isTs } = context;

    return {
      dependencies: {
        jsonwebtoken: '^9.0.2',
        // Zod is needed if not already there, but let's assume it might be needed for auth validation regardless of swagger
        zod: '^3.22.4',
      },
      devDependencies: (isTs
        ? {
            '@types/jsonwebtoken': '^9.0.5',
          }
        : {}) as Record<string, string>,
      files: [
        {
          path: isTs ? 'middleware/auth.ts' : 'middleware/auth.js',
          content: isTs ? authMiddlewareTs : authMiddlewareJs,
        },
        {
          path: isTs ? 'routes/auth.ts' : 'routes/auth.js',
          content: isTs ? authRouterTs : authRouterJs,
        },
      ],
      env: {
        JWT_SECRET: 'super-secret-key',
      },
    } as import('@express-tool/core').PluginAction;
  },
};
