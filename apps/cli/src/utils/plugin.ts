import { Plugin, PluginContext } from '@express-tool/core';
import fs from 'fs-extra';
import path from 'path';
import { logger } from './logger';

export async function executePlugin(
  plugin: Plugin,
  context: PluginContext,
  targetDir: string,
  packageJson: any,
  envVars: string[],
  pluginOptions?: any,
) {
  logger.info(`Applying plugin: ${plugin.name}`);
  const action = await plugin.apply(context, pluginOptions);

  // 1. Merge dependencies
  if (action.dependencies) {
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...action.dependencies,
    };
  }

  if (action.devDependencies) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ...action.devDependencies,
    };
  }

  // 2. Write files
  if (action.files) {
    for (const file of action.files) {
      const filePath = path.join(targetDir, 'src', file.path);
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeFileSync(filePath, file.content);
      logger.info(`  Created ${file.path}`);
    }
  }

  // 3. Update env vars
  if (action.env) {
    for (const [key, value] of Object.entries(action.env)) {
      envVars.push(`${key}=${value}`);
    }
  }

  // 4. Scripts (if any)
  if (action.scripts) {
    packageJson.scripts = {
      ...packageJson.scripts,
      ...action.scripts,
    };
  }

  // 5. Run Commands (if any)
  if (action.commands) {
    for (const command of action.commands) {
      logger.info(`  Running command: ${command}`);
      try {
        require('child_process').execSync(command, {
          cwd: targetDir,
          stdio: 'inherit',
        });
      } catch (error) {
        logger.warn(`  Command failed: ${command}`);
      }
    }
  }

  return action;
}
