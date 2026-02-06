import {
  controllerJs,
  controllerTs,
  routesJs,
  routesTs,
  testJs,
  testTs,
} from '@express-next/plugin-resource';
import fs from 'fs-extra';
import path from 'path';
import { logger } from '../utils/logger';

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function generateResource(name: string) {
  const projectRoot = process.cwd();
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    logger.error('No package.json found. Are you in the root of the project?');
    process.exit(1);
  }

  const packageJson = fs.readJsonSync(packageJsonPath);
  const isTs = packageJson.devDependencies && packageJson.devDependencies.typescript;
  const ext = isTs ? 'ts' : 'js';

  const srcDir = path.join(projectRoot, 'src');
  const controllersDir = path.join(srcDir, 'controllers');
  const routesDir = path.join(srcDir, 'routes');
  const testDir = path.join(projectRoot, 'test');

  // Ensure directories exist
  fs.ensureDirSync(controllersDir);
  fs.ensureDirSync(routesDir);
  fs.ensureDirSync(testDir);

  const capitalizedName = capitalize(name);

  // Generate Controller
  const controllerPath = path.join(controllersDir, `${name.toLowerCase()}.controller.${ext}`);
  if (fs.existsSync(controllerPath)) {
    logger.warn(`Controller ${controllerPath} already exists. Skipping.`);
  } else {
    fs.writeFileSync(
      controllerPath,
      isTs ? controllerTs(capitalizedName) : controllerJs(capitalizedName),
    );
    logger.info(`Created controller: src/controllers/${name.toLowerCase()}.controller.${ext}`);
  }

  // Generate Routes
  const routesPath = path.join(routesDir, `${name.toLowerCase()}.routes.${ext}`);
  if (fs.existsSync(routesPath)) {
    logger.warn(`Route ${routesPath} already exists. Skipping.`);
  } else {
    fs.writeFileSync(routesPath, isTs ? routesTs(capitalizedName) : routesJs(capitalizedName));
    logger.info(`Created route: src/routes/${name.toLowerCase()}.routes.${ext}`);
  }

  // Generate Test
  const testPath = path.join(testDir, `${name.toLowerCase()}.test.${ext}`);
  if (fs.existsSync(testPath)) {
    logger.warn(`Test ${testPath} already exists. Skipping.`);
  } else {
    fs.writeFileSync(testPath, isTs ? testTs(capitalizedName) : testJs(capitalizedName));
    logger.info(`Created test: test/${name.toLowerCase()}.test.${ext}`);
  }

  logger.success(`Feature ${name} generated successfully!`);
  logger.info(`\nDon't forget to register the route in src/index.${ext}:`);
  logger.info(
    `import { ${name.toLowerCase()}Router } from './routes/${name.toLowerCase()}.routes';`,
  );
  logger.info(`app.use('/${name.toLowerCase()}s', ${name.toLowerCase()}Router);`);
}
