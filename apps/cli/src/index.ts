import { Command } from 'commander';
import pkg from '../package.json' with { type: 'json' };
import { logger } from './utils/logger';
const { version } = pkg;

import { initCommand } from './commands/init';

export const cli = new Command();

cli
  .name('express-next')
  .description('Production-grade CLI for Express.js applications')
  .version(version);

cli.hook('preAction', () => {
  logger.info('Welcome to express-next CLI');
});

import { generate } from './commands/generate';
import { info } from './commands/info';
import { upgrade } from './commands/upgrade';

cli.addCommand(initCommand);
cli.addCommand(generate);
cli.addCommand(info);
cli.addCommand(upgrade);
