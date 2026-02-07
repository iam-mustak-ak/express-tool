import prompts from 'prompts';
import { z } from 'zod';
import { logger } from '../utils/logger';

export const initOptionsSchema = z.object({
  projectName: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      'Project name must be kebab-case (lowercase letters, numbers, and hyphens)',
    ),
  language: z.enum(['ts', 'js']),
  architecture: z.enum(['feature', 'mvc']),
  apiType: z.enum(['rest', 'rest-swagger']),
  database: z.enum(['postgresql', 'prisma-postgres', 'mysql', 'mongodb', 'none']),
  auth: z.enum(['jwt', 'none']),
  templateEngine: z.enum(['ejs', 'pug', 'none']),
  packageManager: z.enum(['npm', 'pnpm', 'yarn', 'bun']),
  linting: z.boolean(),
  validation: z.boolean(),
});

export type InitOptions = z.infer<typeof initOptionsSchema>;

export async function promptInitOptions(): Promise<InitOptions> {
  const response = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'What is your project name?',
        initial: 'my-express-app',
        validate: (value) => {
          const result = initOptionsSchema.shape.projectName.safeParse(value);
          return result.success ? true : result.error.issues[0].message;
        },
      },
      {
        type: 'select',
        name: 'language',
        message: 'Select language',
        choices: [
          { title: 'TypeScript (Recommended)', value: 'ts' },
          { title: 'JavaScript', value: 'js' },
        ],
        initial: 0,
      },
      {
        type: 'select',
        name: 'packageManager',
        message: 'Select package manager',
        choices: [
          { title: 'pnpm (Recommended)', value: 'pnpm' },
          { title: 'npm', value: 'npm' },
          { title: 'Yarn', value: 'yarn' },
          { title: 'Bun', value: 'bun' },
        ],
        initial: 0,
      },
      {
        type: 'select',
        name: 'architecture',
        message: 'Select architecture',
        choices: [
          {
            title: 'Feature-based (Recommended)',
            value: 'feature',
            description: 'Modules grouped by feature (e.g., users, posts)',
          },
          { title: 'MVC', value: 'mvc', description: 'Classic Model-View-Controller structure' },
        ],
        initial: 0,
      },
      {
        type: 'select',
        name: 'apiType',
        message: 'Select API type',
        choices: [
          { title: 'REST API + Swagger', value: 'rest-swagger' },
          { title: 'REST API (Basic)', value: 'rest' },
        ],
        initial: 0,
      },
      {
        type: 'select',
        name: 'database',
        message: 'Select database',
        choices: [
          { title: 'PostgreSQL (Prisma)', value: 'postgresql' },
          { title: 'PostgreSQL (Prisma Postgres Managed)', value: 'prisma-postgres' },
          { title: 'MySQL (Prisma)', value: 'mysql' },
          { title: 'MongoDB (Mongoose)', value: 'mongodb' },
          { title: 'None', value: 'none' },
        ],
        initial: 0,
      },
      {
        type: 'select',
        name: 'auth',
        message: 'Select authentication',
        choices: [
          { title: 'JWT (JSON Web Token)', value: 'jwt' },
          { title: 'None', value: 'none' },
        ],
        initial: 0,
      },
      {
        type: 'select',
        name: 'templateEngine',
        message: 'Select template engine',
        choices: [
          { title: 'EJS (Embedded JavaScript)', value: 'ejs' },
          { title: 'Pug (Jade)', value: 'pug' },
          { title: 'None (API only)', value: 'none' },
        ],
        initial: 0,
      },
      {
        type: 'confirm',
        name: 'linting',
        message: 'Do you want to include code quality tools (Linting & Formatting)?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'validation',
        message: 'Do you want to include runtime validation (Zod)?',
        initial: true,
      },
    ],
    {
      onCancel: () => {
        logger.error('Operation cancelled');
        process.exit(1);
      },
    },
  );

  return response as InitOptions;
}
