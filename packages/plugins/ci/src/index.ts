import { Plugin, PluginContext } from '@express-tool/core';

export const ciWorkflow = (pm: 'npm' | 'pnpm' | 'yarn' | 'bun') => {
  const installCmd =
    pm === 'npm'
      ? 'npm ci'
      : pm === 'yarn'
        ? 'yarn install --frozen-lockfile'
        : pm === 'bun'
          ? 'bun install --frozen-lockfile'
          : 'pnpm install --frozen-lockfile';
  const runCmd =
    pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm === 'bun' ? 'bun run' : 'pnpm';

  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      ${
        pm === 'pnpm'
          ? `- name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8`
          : ''
      }
      ${
        pm === 'bun'
          ? `- name: Install Bun
        uses: oven-sh/setup-bun@v1`
          : ''
      }
          
      - name: Install dependencies
        run: ${installCmd}
        
      - name: Lint
        run: ${runCmd} lint
        
      - name: Type Check
        if: \${{ hashFiles('tsconfig.json') != '' }}
        run: ${runCmd} tsc --noEmit
        
      - name: Build
        if: \${{ hashFiles('tsconfig.json') != '' }}
        run: ${runCmd} build

      - name: Test
        run: ${runCmd} test
`;
};

export const ciPlugin: Plugin = {
  name: 'ci',
  apply: async (
    context: PluginContext,
    options: { packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' },
  ) => {
    const { packageManager } = options;

    return {
      files: [
        {
          path: '../.github/workflows/ci.yml',
          content: ciWorkflow(packageManager),
        },
      ],
    } as import('@express-tool/core').PluginAction;
  },
};
