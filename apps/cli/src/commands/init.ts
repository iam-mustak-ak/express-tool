import { Command } from 'commander';
import { generateBaseApp } from './init.generator.js';
import { promptInitOptions } from './init.prompts.js';

export const initCommand = new Command('init')
  .description('Initialize a new Express.js project')
  .action(async () => {
    const options = await promptInitOptions();
    await generateBaseApp(options);
  });
