import { Plugin, PluginContext } from '@express-tool/core';

export const swaggerConfigTs = `import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

export function generateOpenApiDocs() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Express API',
      description: 'API Documentation generated from Zod schemas',
    },
    servers: [{ url: '/api/v1' }],
  });
}
`;

export const swaggerRegistryTs = `import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export const registry = new OpenAPIRegistry();
`;

export const swaggerIndexTs = `import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';
import { generateOpenApiDocs } from './generator';

export const swaggerRouter = Router();

const docs = generateOpenApiDocs();

swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(docs));
swaggerRouter.get('/docs.json', (_, res) => res.json(docs));
`;

export const swaggerConfigJs = `import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry.js';

export function generateOpenApiDocs() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Express API',
      description: 'API Documentation generated from Zod schemas',
    },
    servers: [{ url: '/api/v1' }],
  });
}
`;

export const swaggerRegistryJs = `import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export const registry = new OpenAPIRegistry();
`;

export const swaggerIndexJs = `import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';
import { generateOpenApiDocs } from './generator.js';

export const swaggerRouter = Router();

const docs = generateOpenApiDocs();

swaggerRouter.use('/', swaggerUi.serve, swaggerUi.setup(docs));
swaggerRouter.get('/docs.json', (_, res) => res.json(docs));
`;

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

export const swaggerPlugin: Plugin = {
  name: 'swagger',
  apply: async (context: PluginContext) => {
    const { isTs } = context;

    return {
      dependencies: {
        'swagger-ui-express': '^5.0.0',
        zod: '^4.3.6',
        '@asteasolutions/zod-to-openapi': '^7.3.0',
      },
      devDependencies: (isTs
        ? {
            '@types/swagger-ui-express': '^4.1.6',
          }
        : {}) as Record<string, string>,
      files: [
        {
          path: isTs ? 'docs/generator.ts' : 'docs/generator.js',
          content: isTs ? swaggerConfigTs : swaggerConfigJs,
        },
        {
          path: isTs ? 'docs/registry.ts' : 'docs/registry.js',
          content: isTs ? swaggerRegistryTs : swaggerRegistryJs,
        },
        {
          path: isTs ? 'docs/index.ts' : 'docs/index.js',
          content: isTs ? swaggerIndexTs : swaggerIndexJs,
        },
        {
          path: isTs ? 'middleware/validate.ts' : 'middleware/validate.js',
          content: isTs ? validationMiddlewareTs : validationMiddlewareJs,
        },
      ],
    } as import('@express-tool/core').PluginAction;
  },
};
