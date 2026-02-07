import { Plugin, PluginContext } from '@express-tool/core';

export const validationMiddlewareTs = `import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject<any, any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues,
      });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
`;

export const validationMiddlewareJs = `import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues,
      });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};
`;

export const middlewarePlugin: Plugin = {
  name: 'middleware',
  apply: async (context: PluginContext) => {
    const { isTs } = context;

    return {
      dependencies: {
        zod: '^4.3.6',
      },
      files: [
        {
          path: isTs ? 'middleware/validate.ts' : 'middleware/validate.js',
          content: isTs ? validationMiddlewareTs : validationMiddlewareJs,
        },
      ],
    } as import('@express-tool/core').PluginAction;
  },
};
