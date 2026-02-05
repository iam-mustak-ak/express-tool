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
    },
    devDependencies: {},
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

  if (options.language === 'ts') {
    Object.assign(packageJson.devDependencies, {
      typescript: '^5.4.0',
      '@types/node': '^20.11.0',
      '@types/express': '^4.17.21',
      '@types/cors': '^2.8.17',
      tsx: '^4.7.1',
    });
  }

  fs.writeJsonSync(path.join(projectRoot, 'package.json'), packageJson, { spaces: 2 });

  // Generate src/index.ts
  const srcDir = path.join(projectRoot, 'src');
  fs.mkdirSync(srcDir);

  // Generate Swagger Files if requested
  if (options.apiType === 'rest-swagger') {
    const docsDir = path.join(srcDir, 'docs');
    fs.mkdirSync(docsDir);
    const middlewareDir = path.join(srcDir, 'middleware');
    if (!fs.existsSync(middlewareDir)) fs.mkdirSync(middlewareDir);

    const isTs = options.language === 'ts';

    // Import templates
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

    // Write Docs files
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

    // Write Middleware
    fs.writeFileSync(
      path.join(middlewareDir, isTs ? 'validate.ts' : 'validate.js'),
      isTs ? validationMiddlewareTs : validationMiddlewareJs,
    );
  }

  // Generate Database Config if requested
  if (options.database !== 'none') {
    const isTs = options.language === 'ts';

    // Add dependencies
    Object.assign(packageJson.dependencies, {
      '@prisma/client': '^5.10.0',
    });
    Object.assign(packageJson.devDependencies, {
      prisma: '^5.10.0',
    });

    // Update scripts
    packageJson.scripts.postinstall = 'prisma generate';
    packageJson.scripts.migration = 'prisma migrate dev';
    packageJson.scripts.studio = 'prisma studio';

    fs.writeJsonSync(path.join(projectRoot, 'package.json'), packageJson, { spaces: 2 });

    // Import templates
    const { prismaSchema, dbClientTs, dbClientJs } = await import('../templates/database.js');

    // Create prisma directory and schema
    const prismaDir = path.join(projectRoot, 'prisma');
    fs.mkdirSync(prismaDir);
    fs.writeFileSync(path.join(prismaDir, 'schema.prisma'), prismaSchema(options.database));

    // Create src/lib/db.ts
    const libDir = path.join(srcDir, 'lib');
    if (!fs.existsSync(libDir)) fs.mkdirSync(libDir);
    fs.writeFileSync(path.join(libDir, isTs ? 'db.ts' : 'db.js'), isTs ? dbClientTs : dbClientJs);

    // Create .env file with placeholder
    const envContent = `DATABASE_URL="${options.database}://user:password@localhost:5432/${options.projectName}?schema=public"
PORT=3000
NODE_ENV=development`;
    fs.writeFileSync(path.join(projectRoot, '.env'), envContent);
    // Create .env.example
    fs.writeFileSync(path.join(projectRoot, '.env.example'), envContent);
  } else {
    // Basic .env if no DB
    const envContent = `PORT=3000
NODE_ENV=development`;
    fs.writeFileSync(path.join(projectRoot, '.env'), envContent);
    fs.writeFileSync(path.join(projectRoot, '.env.example'), envContent);
  }

  let indexContent = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
`;

  if (options.apiType === 'rest-swagger') {
    indexContent += `import { swaggerRouter } from './docs/index.js';\n`;
  }

  indexContent += `
const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

`;

  if (options.apiType === 'rest-swagger') {
    indexContent += `app.use('/docs', swaggerRouter);\n`;
  }

  indexContent += `app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(\`Server running on http://localhost:\${port}\`);
});
`;

  const fileName = options.language === 'ts' ? 'index.ts' : 'index.js';
  fs.writeFileSync(path.join(srcDir, fileName), indexContent);

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
