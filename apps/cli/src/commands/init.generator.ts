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

  // Generate Auth if requested
  if (options.auth === 'jwt') {
    const isTs = options.language === 'ts';

    // Add dependencies
    Object.assign(packageJson.dependencies, {
      jsonwebtoken: '^9.0.2',
    });
    if (isTs) {
      Object.assign(packageJson.devDependencies, {
        '@types/jsonwebtoken': '^9.0.5',
      });
    }

    fs.writeJsonSync(path.join(projectRoot, 'package.json'), packageJson, { spaces: 2 });

    const middlewareDir = path.join(srcDir, 'middleware');
    if (!fs.existsSync(middlewareDir)) fs.mkdirSync(middlewareDir);

    // Import templates
    const { authMiddlewareTs, authMiddlewareJs, authRouterTs, authRouterJs } =
      await import('../templates/auth.js');

    // Write Middleware
    fs.writeFileSync(
      path.join(middlewareDir, isTs ? 'auth.ts' : 'auth.js'),
      isTs ? authMiddlewareTs : authMiddlewareJs,
    );

    // Write Auth Route
    const routesDir = path.join(srcDir, 'routes');
    if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir);
    fs.writeFileSync(
      path.join(routesDir, isTs ? 'auth.ts' : 'auth.js'),
      isTs ? authRouterTs : authRouterJs,
    );
  }

  // Generate Views if requested
  if (options.templateEngine !== 'none') {
    const isTs = options.language === 'ts';

    // Add dependencies
    Object.assign(packageJson.dependencies, {
      [options.templateEngine]: options.templateEngine === 'ejs' ? '^3.1.9' : '^3.0.2',
    });
    if (isTs) {
      Object.assign(packageJson.devDependencies, {
        [`@types/${options.templateEngine}`]:
          options.templateEngine === 'ejs' ? '^3.1.5' : '^2.0.10',
      });
    }

    fs.writeJsonSync(path.join(projectRoot, 'package.json'), packageJson, { spaces: 2 });

    const viewsDir = path.join(srcDir, 'views');
    fs.mkdirSync(viewsDir);

    // Import templates
    const { ejsTemplates, pugTemplates, cssStyle } = await import('../templates/views.js');
    const templates = options.templateEngine === 'ejs' ? ejsTemplates : pugTemplates;
    const ext = options.templateEngine;

    // Write Views
    fs.writeFileSync(path.join(viewsDir, `index.${ext}`), templates.index);
    fs.writeFileSync(path.join(viewsDir, `error.${ext}`), templates.error);

    // Write Public CSS
    const publicDir = path.join(srcDir, 'public');
    const cssDir = path.join(publicDir, 'css');
    fs.mkdirSync(publicDir);
    fs.mkdirSync(cssDir);
    fs.writeFileSync(path.join(cssDir, 'style.css'), cssStyle);
  }

  let indexContent = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
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
`;

  if (options.auth === 'jwt') {
    indexContent += `
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: (req as any).user });
});\n`;
  }

  indexContent += `app.listen(port, () => {
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
