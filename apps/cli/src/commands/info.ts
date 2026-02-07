import { Command } from 'commander';
// @ts-ignore
import envinfo from 'envinfo';

export const info = new Command()
  .name('info')
  .description('Print debugging information about your environment')
  .action(async () => {
    console.log('  System:');
    await envinfo.run(
      {
        System: ['OS', 'CPU', 'Memory', 'Shell'],
        Binaries: ['Node', 'Yarn', 'npm', 'pnpm'],
        Utilities: ['Git'],
        IDEs: ['VSCode'],
        Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
        npmPackages: ['typescript', 'express', 'express-tool'],
      },
      {
        console: true,
        showNotFound: true,
      },
    );
  });
