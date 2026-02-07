import { authPlugin } from '@express-tool/plugin-auth';
import { ciPlugin } from '@express-tool/plugin-ci';
import { commonPlugin } from '@express-tool/plugin-common';
import { databasePlugin } from '@express-tool/plugin-database';
import { dockerPlugin } from '@express-tool/plugin-docker';
import { middlewarePlugin } from '@express-tool/plugin-middleware';
import { qualityPlugin } from '@express-tool/plugin-quality';
import { swaggerPlugin } from '@express-tool/plugin-swagger';
import { testingPlugin } from '@express-tool/plugin-testing';
import { viewsPlugin } from '@express-tool/plugin-views';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger';
import { executePlugin } from '../utils/plugin';
import { InitOptions } from './init.prompts';

export async function generateBaseApp(options: InitOptions) {
  const projectRoot = path.resolve(process.cwd(), options.projectName);

  if (fs.existsSync(projectRoot)) {
    logger.error(`Directory ${options.projectName} already exists.`);
    process.exit(1);
  }

  logger.info(`Creating project in ${projectRoot}...`);
  fs.mkdirSync(projectRoot);

  const envVars: string[] = [];

  // Generate package.json
  const packageJson: any = {
    name: options.projectName,
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: options.language === 'ts' ? 'tsx watch src/index.ts' : 'nodemon src/index.js',
      build:
        options.language === 'ts'
          ? 'tsup src/index.ts --format esm --platform node --target es2022 --clean'
          : undefined,
      start: options.language === 'ts' ? 'node dist/index.js' : 'node src/index.js',
      ...(options.language === 'ts' ? { typecheck: 'tsc --noEmit', test: 'vitest' } : {}),
    },
    dependencies: {
      express: '^4.21.0',
    },
    devDependencies: {
      ...(options.language === 'ts'
        ? {
            '@types/node': '^20.12.0',
            '@types/express': '^4.17.21',
            tsup: '^8.1.0',
            tsx: '^4.19.2',
            typescript: '^5.7.0',
          }
        : {}),
    },
    engines: {
      node: '>=20.0.0',
    },
  };

  // Add specific dependencies based on API type
  if (options.apiType === 'rest-swagger') {
    Object.assign(packageJson.dependencies, {
      'swagger-ui-express': '^5.0.0',
      zod: '^3.23.8',
      '@asteasolutions/zod-to-openapi': '^7.3.0',
    });
    if (options.language === 'ts') {
      Object.assign(packageJson.devDependencies, {
        '@types/swagger-ui-express': '^4.1.6',
      });
    }
  }

  // Auth dependencies
  if (options.auth === 'jwt') {
    Object.assign(packageJson.dependencies, {
      jsonwebtoken: '^9.0.2',
    });
    if (options.language === 'ts') {
      Object.assign(packageJson.devDependencies, {
        '@types/jsonwebtoken': '^9.0.6',
      });
    }
  }

  // Template engine dependencies
  if (options.templateEngine !== 'none') {
    const version = options.templateEngine === 'ejs' ? '^3.1.10' : '^3.0.3';
    Object.assign(packageJson.dependencies, {
      [options.templateEngine]: version,
    });
    if (options.language === 'ts') {
      const typesVersion = options.templateEngine === 'ejs' ? '^3.1.5' : '^2.0.10';
      Object.assign(packageJson.devDependencies, {
        [`@types/${options.templateEngine}`]: typesVersion,
      });
    }
  }

  fs.writeJsonSync(path.join(projectRoot, 'package.json'), packageJson, { spaces: 2 });

  // Generate src/index.ts
  const srcDir = path.join(projectRoot, 'src');
  fs.mkdirSync(srcDir);

  const isTs = options.language === 'ts';

  // plugin context
  const context = {
    projectRoot,
    projectName: options.projectName,
    isTs: options.language === 'ts',
    language: options.language,
  };

  // Apply Common Plugin (Logger, Error Handler, etc.)
  await executePlugin(commonPlugin, context, projectRoot, packageJson, envVars);

  // Apply Middleware Plugin
  if (options.validation) {
    await executePlugin(middlewarePlugin, context, projectRoot, packageJson, envVars);
  }

  // Generate Swagger Files if requested
  if (options.apiType === 'rest-swagger') {
    await executePlugin(swaggerPlugin, context, projectRoot, packageJson, envVars);
  }

  // Generate Database Config if requested
  if (options.database !== 'none') {
    await executePlugin(databasePlugin, context, projectRoot, packageJson, envVars, {
      database: options.database,
    });
  }

  // Generate Auth if requested
  if (options.auth === 'jwt') {
    await executePlugin(authPlugin, context, projectRoot, packageJson, envVars);
  }

  // Generate Views if requested
  if (options.templateEngine !== 'none') {
    await executePlugin(viewsPlugin, context, projectRoot, packageJson, envVars, {
      templateEngine: options.templateEngine,
    });
  }

  const envContent = envVars.join('\n') + '\n';
  fs.writeFileSync(path.join(projectRoot, '.env'), envContent);
  fs.writeFileSync(path.join(projectRoot, '.env.example'), envContent);

  // Generate index logic
  let indexContent = `import 'dotenv/config';
import express${options.language === 'ts' ? ', { Request, Response }' : ''} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import pinoHttp from 'pino-http';
import { rateLimit } from 'express-rate-limit';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
${options.database === 'mongodb' ? "import { connectDB } from './lib/db';" : ''}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

${options.auth === 'jwt' ? "import { authRouter } from './routes/auth';\nimport { authenticateToken } from './middleware/auth';" : ''}
${options.apiType === 'rest-swagger' ? "import { swaggerRouter } from './docs/index';" : ''}

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

${options.database === 'mongodb' ? 'connectDB();' : ''}

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
    indexContent += `app.use('/docs', swaggerRouter);
`;
  }

  if (options.auth === 'jwt') {
    indexContent += `app.use('/auth', authRouter);
`;
  }

  indexContent += `app.get('/', (req${options.language === 'ts' ? ': Request' : ''}, res${options.language === 'ts' ? ': Response' : ''}) => {
  ${
    options.templateEngine !== 'none'
      ? `res.render('index', { title: 'Express App', message: 'Hello from ${options.templateEngine.toUpperCase()}!' });`
      : `res.json({ status: 'ok', timestamp: new Date().toISOString() });`
  }
});

app.get('/health', (req${options.language === 'ts' ? ': Request' : ''}, res${options.language === 'ts' ? ': Response' : ''}) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
`;

  if (options.auth === 'jwt') {
    indexContent += `
app.get('/protected', authenticateToken, (req${options.language === 'ts' ? ': Request' : ''}, res${options.language === 'ts' ? ': Response' : ''}) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});\n`;
  }

  // Error Handler must be last
  indexContent += `
app.use(errorHandler);

// Export app for testing
export { app };

// Start server
if (process.env.NODE_ENV !== 'test') {
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
}
`;

  const fileName = options.language === 'ts' ? 'index.ts' : 'index.js';
  fs.writeFileSync(path.join(srcDir, fileName), indexContent);

  // --- Step 9: Testing & Quality ---
  await executePlugin(testingPlugin, context, projectRoot, packageJson, envVars);
  if (options.linting) {
    await executePlugin(qualityPlugin, context, projectRoot, packageJson, envVars);
  }

  // --- Step 10: Docker & CI ---
  await executePlugin(dockerPlugin, context, projectRoot, packageJson, envVars, {
    packageManager: options.packageManager,
    database: options.database,
  });
  await executePlugin(ciPlugin, context, projectRoot, packageJson, envVars, {
    packageManager: options.packageManager,
  });

  // Generate tsconfig.json if TS
  if (options.language === 'ts') {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        rootDir: './src',
        outDir: './dist',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        declaration: true,
        sourceMap: true,
        noEmit: true,
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

  // Update package.json with final dependencies
  fs.writeJsonSync(path.join(projectRoot, 'package.json'), packageJson, { spaces: 2 });

  // Install dependencies
  logger.info('Installing dependencies...');
  try {
    const installCmd = options.packageManager === 'npm' ? 'install' : 'install';
    // pnpm install, yarn install, npm install
    require('child_process').execSync(`${options.packageManager} ${installCmd}`, {
      cwd: projectRoot,
      stdio: 'inherit',
    });
  } catch (error) {
    logger.warn('Failed to install dependencies. Please run install manually.');
  }

  logger.success(`Project ${options.projectName} created successfully!`);

  console.log(`\nNext steps:`);
  console.log(`  cd ${options.projectName}`);
  console.log(`  ${options.packageManager} run dev`);

  if (options.database === 'prisma-postgres') {
    console.log(`  ${options.packageManager} run db:init (To setup Prisma Postgres Managed DB)`);
  }
  console.log(`\nHappy Coding! 🚀\n`);
}
