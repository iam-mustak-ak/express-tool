export const swaggerConfigTs = `import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
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

export const swaggerRegistryTs = `import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export const registry = new OpenAPIRegistry();
`;

export const swaggerIndexTs = `import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';
import { generateOpenApiDocs } from './generator.js';

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
