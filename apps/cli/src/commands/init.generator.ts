import { authPlugin } from '@express-next/plugin-auth';
import { ciPlugin } from '@express-next/plugin-ci';
import { commonPlugin } from '@express-next/plugin-common';
import { databasePlugin } from '@express-next/plugin-database';
import { dockerPlugin } from '@express-next/plugin-docker';
import { middlewarePlugin } from '@express-next/plugin-middleware';
import { qualityPlugin } from '@express-next/plugin-quality';
import { swaggerPlugin } from '@express-next/plugin-swagger';
import { testingPlugin } from '@express-next/plugin-testing';
import { viewsPlugin } from '@express-next/plugin-views';
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
    packageManager: `${options.packageManager}@latest`,
    scripts: {
      dev: options.language === 'ts' ? 'tsx watch src/index.ts' : 'node --watch src/index.js',
      build: options.language === 'ts' ? 'tsc' : undefined,
      start: options.language === 'ts' ? 'node dist/index.js' : 'node src/index.js',
    },
    dependencies: {
      express: '^4.18.2',
      // Common dependencies are now handled by commonPlugin
    },
    devDependencies: {
      // Dev dependencies handled by plugins
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

  // TypeScript dependencies handled by quality/common plugins partly, but specific types might be here?
  // Common plugin handles types/node, types/express, etc.

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
  await executePlugin(middlewarePlugin, context, projectRoot, packageJson, envVars);

  // Generate Swagger Files if requested
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
    // Use auth plugin
    const envVars: string[] = [];
    await executePlugin(authPlugin, context, projectRoot, packageJson, envVars);
  }

  // Generate Views if requested
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
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import pinoHttp from 'pino-http';
import { rateLimit } from 'express-rate-limit';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
${options.database === 'mongodb' ? "import { connectDB } from './lib/db';" : ''}
`;

  if (options.auth === 'jwt') {
    indexContent += `import { authRouter } from './routes/auth';\n`;
    indexContent += `import { authenticateToken } from './middleware/auth';\n`;
  }

  if (options.apiType === 'rest-swagger') {
    indexContent += `import { swaggerRouter } from './docs/index';\n`;
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
  await executePlugin(testingPlugin, context, projectRoot, packageJson, envVars);
  await executePlugin(qualityPlugin, context, projectRoot, packageJson, envVars);

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
