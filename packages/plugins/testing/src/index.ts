import { Plugin, PluginContext } from '@express-tool/core';

export const vitestConfigTs = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
`;

export const vitestConfigJs = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
`;

export const appTestTs = `import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('App Integration Tests', () => {
  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /unknown should return 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });
});
`;

export const appTestJs = `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';

describe('App Integration Tests', () => {
  it('GET /health should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('GET /unknown should return 404', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });
});
`;

export const testingPlugin: Plugin = {
  name: 'testing',
  apply: async (context: PluginContext) => {
    const { isTs } = context;

    return {
      devDependencies: {
        vitest: '^4.0.18',
        supertest: '^7.2.2',
        ...(isTs
          ? {
              '@types/supertest': '^6.0.3',
            }
          : {}),
      },
      scripts: {
        test: 'vitest',
      },
      files: [
        {
          path: isTs ? '../vitest.config.ts' : '../vitest.config.js',
          content: isTs ? vitestConfigTs : vitestConfigJs,
        },
        {
          path: isTs ? '../test/app.test.ts' : '../test/app.test.js',
          content: isTs ? appTestTs : appTestJs,
        },
      ],
    } as import('@express-tool/core').PluginAction;
  },
};
