import { Command } from 'commander';
import https from 'https';
import packageJson from '../../package.json' with { type: 'json' };
import { logger } from '../utils/logger';

export const upgrade = new Command()
  .name('upgrade')
  .description('Check for updates')
  .action(async () => {
    logger.info('Checking for updates...');
    const currentVersion = packageJson.version;
    const pkgName = packageJson.name;

    try {
      const latestVersion = await fetchLatestVersion(pkgName);
      if (!latestVersion) {
        logger.warn('Could not fetch latest version info.');
        return;
      }

      if (latestVersion !== currentVersion) {
        logger.info(`New version available: ${latestVersion} (current: ${currentVersion})`);
        logger.info(`Run 'npm install -g ${pkgName}' to update.`);
      } else {
        logger.success('You are using the latest version.');
      }
    } catch (error) {
      logger.error('Failed to check for updates.');
    }
  });

function fetchLatestVersion(packageName: string): Promise<string | null> {
  return new Promise((resolve) => {
    https
      .get(`https://registry.npmjs.org/${packageName}/latest`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json.version);
          } catch {
            resolve(null);
          }
        });
      })
      .on('error', () => resolve(null));
  });
}
