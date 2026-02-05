import { Command } from 'commander';
import { version } from '../package.json';
import { logger } from './utils/logger.js';

import { initCommand } from './commands/init.js';

export const cli = new Command();

cli
  .name('express-next')
  .description('Production-grade CLI for Express.js applications')
  .version(version);

cli.hook('preAction', () => {
  logger.info('Welcome to express-next CLI');
});

cli.addCommand(initCommand);
