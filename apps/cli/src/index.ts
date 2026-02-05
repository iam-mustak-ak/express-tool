import { Command } from 'commander';
import pkg from '../package.json' with { type: 'json' };
import { logger } from './utils/logger.js';
const { version } = pkg;

import { initCommand } from './commands/init.js';

export const cli = new Command();

cli
  .name('express-next')
  .description('Production-grade CLI for Express.js applications')
  .version(version);

cli.hook('preAction', () => {
  logger.info('Welcome to express-next CLI');
});

import { info } from './commands/info.js';
import { upgrade } from './commands/upgrade.js';

cli.addCommand(initCommand);
cli.addCommand(info);
cli.addCommand(upgrade);
