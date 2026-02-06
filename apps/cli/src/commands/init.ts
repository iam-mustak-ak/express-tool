import { Command } from 'commander';
import { generateBaseApp } from './init.generator';
import { promptInitOptions } from './init.prompts';

export const initCommand = new Command('init')
  .description('Initialize a new Express.js project')
  .action(async () => {
    const options = await promptInitOptions();
    await generateBaseApp(options);
  });
