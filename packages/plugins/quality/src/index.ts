import { Plugin, PluginContext } from '@express-tool/core';

export const eslintConfig = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};

export const prettierConfig = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 100,
};

export const qualityPlugin: Plugin = {
  name: 'quality',
  apply: async (context: PluginContext) => {
    const { isTs } = context;

    return {
      devDependencies: {
        husky: '^9.0.11',
        'lint-staged': '^15.2.2',
        prettier: '^3.2.5',
        eslint: '^8.57.0',
        'eslint-config-prettier': '^9.1.0',
        ...(isTs
          ? {
              '@typescript-eslint/eslint-plugin': '^7.1.0',
              '@typescript-eslint/parser': '^7.1.0',
            }
          : {}),
      },
      scripts: {
        lint: 'eslint . --ext .ts,.js',
        format: 'prettier --write .',
        prepare: 'husky',
      },
      files: [
        {
          path: '../.eslintrc.json',
          content: JSON.stringify(eslintConfig, null, 2),
        },
        {
          path: '../.prettierrc',
          content: JSON.stringify(prettierConfig, null, 2),
        },
        {
          // We need package.json update for lint-staged but the plugin interface supports merging package.json fields?
          // No, only scripts, dependencies, devDependencies.
          // I updated PluginAction in my head but not in @express-next/core/src/index.ts?
          // I should check PluginAction definition. If it doesn't support generic packageJson updates, I can't easily add lint-staged config.
          // But I can write it to a file if supported? `.lintstagedrc`?
          // For now, I'll stick to writing it to a file or extending the core plugin interface later.
          // I will use .lintstagedrc.json for now to avoid package.json complexity.
          path: '../.lintstagedrc.json',
          content: JSON.stringify(
            {
              '**/*.{ts,js,json,md}': ['prettier --write', 'eslint --fix'],
            },
            null,
            2,
          ),
        },
      ],
    } as import('@express-tool/core').PluginAction;
  },
};
