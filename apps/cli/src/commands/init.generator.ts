import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger.js';
import { InitOptions } from './init.prompts.js';

export async function generateBaseApp(options: InitOptions) {
  const projectRoot = path.resolve(process.cwd(), options.projectName);

  if (fs.existsSync(projectRoot)) {
    logger.error(`Directory ${options.projectName} already exists.`);
    process.exit(1);
  }

  logger.info(`Creating project in ${projectRoot}...`);
  fs.mkdirSync(projectRoot);

  // Generate package.json
  const packageJson: any = {
    name: options.projectName,
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: options.language === 'ts' ? 'tsx watch src/index.ts' : 'node --watch src/index.js',
      build: options.language === 'ts' ? 'tsc' : undefined,
      start: options.language === 'ts' ? 'node dist/index.js' : 'node src/index.js',
    },
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
      helmet: '^7.1.0',
      pino: '^8.19.0',
      'pino-http': '^9.0.0',
      'express-rate-limit': '^7.2.0',
    },
    devDependencies: {
      'pino-pretty': '^10.3.1',
    },
  };

  // Add specific dependencies based on API type
  if (options.apiType === 'rest-swagger') {
    Object.assign(packageJson.dependencies, {
      'swagger-ui-express': '^5.0.0',
      zod: '^3.22.4',
      '@asteasolutions/zod-to-openapi': '^7.0.0',
    });
    if (options.language === 'ts') {
      Object.assign(packageJson.devDependencies, {
        '@types/swagger-ui-express': '^4.1.6',
      });
    }
  }

  // Database dependencies
  if (options.database !== 'none') {
    Object.assign(packageJson.dependencies, {
      '@prisma/client': '^5.10.0',
    });
    Object.assign(packageJson.devDependencies, {
      prisma: '^5.10.0',
    });
    packageJson.scripts.postinstall = 'prisma generate';
    packageJson.scripts.migration = 'prisma migrate dev';
    packageJson.scripts.studio = 'prisma studio';
  }

  // Auth dependencies
  if (options.auth === 'jwt') {
    Object.assign(packageJson.dependencies, {
      jsonwebtoken: '^9.0.2',
    });
    if (options.language === 'ts') {
      Object.assign(packageJson.devDependencies, {
        '@types/jsonwebtoken': '^9.0.5',
      });
    }
  }

  // Template engine dependencies
  if (options.templateEngine !== 'none') {
    Object.assign(packageJson.dependencies, {
      [options.templateEngine]: options.templateEngine === 'ejs' ? '^3.1.9' : '^3.0.2',
    });
    if (options.language === 'ts') {
      Object.assign(packageJson.devDependencies, {
        [`@types/${options.templateEngine}`]:
          options.templateEngine === 'ejs' ? '^3.1.5' : '^2.0.10',
      });
    }
  }

  // TypeScript dependencies and Rate Limit types
  if (options.language === 'ts') {
    Object.assign(packageJson.devDependencies, {
      typescript: '^5.4.0',
      '@types/node': '^20.11.0',
      '@types/express': '^4.17.21',
      '@types/cors': '^2.8.17',
      tsx: '^4.7.1',
      '@types/express-rate-limit': '^6.0.0',
    });
  }

  fs.writeJsonSync(path.join(projectRoot, 'package.json'), packageJson, { spaces: 2 });

  // Generate src/index.ts
  const srcDir = path.join(projectRoot, 'src');
  fs.mkdirSync(srcDir);

  const isTs = options.language === 'ts';

  // Generate Utilities and Middleware (Common)
  const utilsDir = path.join(srcDir, 'utils');
  if (!fs.existsSync(utilsDir)) fs.mkdirSync(utilsDir);

  const middlewareDir = path.join(srcDir, 'middleware');
  if (!fs.existsSync(middlewareDir)) fs.mkdirSync(middlewareDir);

  const { loggerTs, loggerJs, errorHandlerTs, errorHandlerJs } =
    await import('../templates/common.js');

  fs.writeFileSync(
    path.join(utilsDir, isTs ? 'logger.ts' : 'logger.js'),
    isTs ? loggerTs : loggerJs,
  );
  fs.writeFileSync(
    path.join(middlewareDir, isTs ? 'errorHandler.ts' : 'errorHandler.js'),
    isTs ? errorHandlerTs : errorHandlerJs,
  );

  // Generate Swagger Files if requested
  if (options.apiType === 'rest-swagger') {
    const docsDir = path.join(srcDir, 'docs');
    fs.mkdirSync(docsDir);

    const {
      swaggerConfigTs,
      swaggerRegistryTs,
      swaggerIndexTs,
      swaggerConfigJs,
      swaggerRegistryJs,
      swaggerIndexJs,
    } = await import('../templates/swagger.js');
    const { validationMiddlewareTs, validationMiddlewareJs } =
      await import('../templates/middleware.js');

    fs.writeFileSync(
      path.join(docsDir, isTs ? 'generator.ts' : 'generator.js'),
      isTs ? swaggerConfigTs : swaggerConfigJs,
    );
    fs.writeFileSync(
      path.join(docsDir, isTs ? 'registry.ts' : 'registry.js'),
      isTs ? swaggerRegistryTs : swaggerRegistryJs,
    );
    fs.writeFileSync(
      path.join(docsDir, isTs ? 'index.ts' : 'index.js'),
      isTs ? swaggerIndexTs : swaggerIndexJs,
    );
    fs.writeFileSync(
      path.join(middlewareDir, isTs ? 'validate.ts' : 'validate.js'),
      isTs ? validationMiddlewareTs : validationMiddlewareJs,
    );
  }

  // Generate Database Config if requested
  if (options.database !== 'none') {
    const { prismaSchema, dbClientTs, dbClientJs } = await import('../templates/database.js');
    const prismaDir = path.join(projectRoot, 'prisma');
    fs.mkdirSync(prismaDir);
    fs.writeFileSync(path.join(prismaDir, 'schema.prisma'), prismaSchema(options.database));

    const libDir = path.join(srcDir, 'lib');
    if (!fs.existsSync(libDir)) fs.mkdirSync(libDir);
    fs.writeFileSync(path.join(libDir, isTs ? 'db.ts' : 'db.js'), isTs ? dbClientTs : dbClientJs);
  }

  // Generate Auth if requested
  if (options.auth === 'jwt') {
    const { authMiddlewareTs, authMiddlewareJs, authRouterTs, authRouterJs } =
      await import('../templates/auth.js');
    fs.writeFileSync(
      path.join(middlewareDir, isTs ? 'auth.ts' : 'auth.js'),
      isTs ? authMiddlewareTs : authMiddlewareJs,
    );

    const routesDir = path.join(srcDir, 'routes');
    if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir);
    fs.writeFileSync(
      path.join(routesDir, isTs ? 'auth.ts' : 'auth.js'),
      isTs ? authRouterTs : authRouterJs,
    );
  }

  // Generate Views if requested
  if (options.templateEngine !== 'none') {
    const viewsDir = path.join(srcDir, 'views');
    fs.mkdirSync(viewsDir);
    const { ejsTemplates, pugTemplates, cssStyle } = await import('../templates/views.js');
    const templates = options.templateEngine === 'ejs' ? ejsTemplates : pugTemplates;
    const ext = options.templateEngine;

    fs.writeFileSync(path.join(viewsDir, `index.${ext}`), templates.index);
    fs.writeFileSync(path.join(viewsDir, `error.${ext}`), templates.error);

    const publicDir = path.join(srcDir, 'public');
    const cssDir = path.join(publicDir, 'css');
    fs.mkdirSync(publicDir);
    fs.mkdirSync(cssDir);
    fs.writeFileSync(path.join(cssDir, 'style.css'), cssStyle);
  }

  // Generate .env
  const dbUrl =
    options.database !== 'none'
      ? `DATABASE_URL="${options.database}://user:password@localhost:5432/${options.projectName}?schema=public"`
      : '';
  const jwtSecret = options.auth === 'jwt' ? `JWT_SECRET="super-secret-key"` : '';
  const envContent = `PORT=3000
NODE_ENV=development
${dbUrl}
${jwtSecret}
LOG_LEVEL=info
`;
  fs.writeFileSync(path.join(projectRoot, '.env'), envContent);
  fs.writeFileSync(path.join(projectRoot, '.env.example'), envContent);

  // Generate index logic
  let indexContent = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import pinoHttp from 'pino-http';
import { rateLimit } from 'express-rate-limit';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
`;

  if (options.auth === 'jwt') {
    indexContent += `import { authRouter } from './routes/auth.js';\n`;
    indexContent += `import { authenticateToken } from './middleware/auth.js';\n`;
  }

  if (options.apiType === 'rest-swagger') {
    indexContent += `import { swaggerRouter } from './docs/index.js';\n`;
  }

  indexContent += `
const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 100, 
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

// View Engine Setup
${
  options.templateEngine !== 'none'
    ? `
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '${options.templateEngine}');
app.use(express.static(path.join(__dirname, 'public')));
`
    : ''
}

`;

  if (options.apiType === 'rest-swagger') {
    indexContent += `app.use('/docs', swaggerRouter);\n`;
  }

  if (options.auth === 'jwt') {
    indexContent += `app.use('/auth', authRouter);\n`;
  }

  indexContent += `app.get('/', (req, res) => {
  ${
    options.templateEngine !== 'none'
      ? `res.render('index', { title: 'Express App', message: 'Hello from ${options.templateEngine.toUpperCase()}!' });`
      : `res.json({ status: 'ok', timestamp: new Date().toISOString() });`
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
`;

  if (options.auth === 'jwt') {
    indexContent += `
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});\n`;
  }

  // Error Handler must be last
  indexContent += `
app.use(errorHandler);

// Export app for testing
export { app };
`;

  // Start server only if directly run
  const serverListen = `
const server = app.listen(port, () => {
  logger.info(\`Server running on http://localhost:\${port}\`);
});

// Graceful Shutdown
const shutdown = () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
`;

  if (options.language === 'ts') {
    indexContent += `
if (import.meta.url === \`file://\${process.argv[1]}\`) {
${serverListen}
}
`;
  } else {
    indexContent += `
if (process.argv[1] === import.meta.filename) { // Node 20.11+
${serverListen}
} else if (import.meta.url === \`file://\${process.argv[1]}\`) {
${serverListen}
}
`;
  }

  const fileName = options.language === 'ts' ? 'index.ts' : 'index.js';
  fs.writeFileSync(path.join(srcDir, fileName), indexContent);

  // --- Step 9: Testing & Quality ---

  // Add dependencies
  Object.assign(packageJson.devDependencies, {
    vitest: '^1.3.1',
    supertest: '^6.3.4',
    husky: '^9.0.11',
    'lint-staged': '^15.2.2',
    prettier: '^3.2.5',
    eslint: '^8.57.0',
    'eslint-config-prettier': '^9.1.0',
  });

  if (isTs) {
    Object.assign(packageJson.devDependencies, {
      '@types/supertest': '^6.0.2',
      '@typescript-eslint/eslint-plugin': '^7.1.0',
      '@typescript-eslint/parser': '^7.1.0',
    });
  }

  packageJson.scripts.test = 'vitest';
  packageJson.scripts.lint = 'eslint . --ext .ts,.js';
  packageJson.scripts.format = 'prettier --write .';
  packageJson.scripts.prepare = 'husky';
  packageJson['lint-staged'] = {
    '**/*.{ts,js,json,md}': ['prettier --write', 'eslint --fix'],
  };

  fs.writeJsonSync(path.join(projectRoot, 'package.json'), packageJson, { spaces: 2 });

  // Generate Configs
  const { vitestConfigTs, vitestConfigJs, appTestTs, appTestJs } =
    await import('../templates/testing.js');
  const { eslintConfig, prettierConfig } = await import('../templates/quality.js');

  fs.writeFileSync(
    path.join(projectRoot, isTs ? 'vitest.config.ts' : 'vitest.config.js'),
    isTs ? vitestConfigTs : vitestConfigJs,
  );
  fs.writeJsonSync(path.join(projectRoot, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  fs.writeJsonSync(path.join(projectRoot, '.prettierrc'), prettierConfig, { spaces: 2 });

  // Generate Tests
  const testDir = path.join(projectRoot, 'test');
  fs.mkdirSync(testDir);
  fs.writeFileSync(
    path.join(testDir, isTs ? 'app.test.ts' : 'app.test.js'),
    isTs ? appTestTs : appTestJs,
  );

  // --- Step 10: Docker & CI ---
  const { dockerfile, dockerCompose } = await import('../templates/docker.js');
  const { ciWorkflow } = await import('../templates/ci.js');

  // Write Dockerfile
  fs.writeFileSync(path.join(projectRoot, 'Dockerfile'), dockerfile(isTs));

  // Write docker-compose.yml
  fs.writeFileSync(path.join(projectRoot, 'docker-compose.yml'), dockerCompose(options.database));

  // Write CI Workflow
  const githubDir = path.join(projectRoot, '.github');
  const workflowsDir = path.join(githubDir, 'workflows');
  fs.mkdirSync(workflowsDir, { recursive: true });
  fs.writeFileSync(path.join(workflowsDir, 'ci.yml'), ciWorkflow);

  // Generate tsconfig.json if TS
  if (options.language === 'ts') {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
      },
      include: ['src/**/*'],
    };
    fs.writeJsonSync(path.join(projectRoot, 'tsconfig.json'), tsConfig, { spaces: 2 });
  }

  // Generate .gitignore
  const gitignore = `node_modules
dist
.env
.DS_Store
`;
  fs.writeFileSync(path.join(projectRoot, '.gitignore'), gitignore);

  logger.success(`Project ${options.projectName} created successfully!`);
}
