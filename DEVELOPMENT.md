# 🛠️ Development Guide for Express Tool

Welcome to the development guide for **Express Tool** (`@express-tool`). This guide will help you set up the monorepo, build the packages, and contribute to the CLI and plugins.

## 📋 Prerequisites

- **Node.js**: v20 or higher (Required for some dev tools)
- **pnpm**: v9 or higher (Strictly required for workspace management)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/iam-mustak-ak/express-tool.git
cd express-tool
```

### 2. Install Dependencies

We use `pnpm` workspace for managing the monorepo.

```bash
pnpm install
```

### 3. Build the Monorepo

You must build the packages (core, plugins) before running the CLI, as the CLI depends on the built artifacts of the plugins.

```bash
pnpm build
```

This runs `turbo build` to compile all packages in topological order.

## 🏃 Running the CLI Locally

To test the CLI during development without installing it globally:

### Method 1: Using the `start` script (Recommended)

You can run the CLI directly from the `apps/cli` directory.

```bash
# Go to the CLI directory
cd apps/cli

# Run the help command
pnpm start -- --help

# Generate a new project
pnpm start -- init
```

### Method 2: Running from Root via Filter

```bash
pnpm --filter @express-tool/cli start -- --help
```

### Method 3: Linking Globally

To use the `express-tool` command globally on your machine while pointing to your local source:

```bash
cd apps/cli
npm link

# Now you can use it anywhere
express-tool --help
```

Remember to unlink when done:

```bash
npm unlink -g @express-tool/cli
```

## 🏗️ Project Structure

The repository is organized as a monorepo using pnpm workspaces:

- **`apps/cli`**: The main CLI tool (`@express-tool/cli`).
- **`packages/core`**: Core logic and types shared across plugins (`@express-tool/core`).
- **`packages/plugins/*`**: Official feature plugins:
  - `auth`: Authentication strategies (JWT, etc.)
  - `database`: Database setup (Prisma, Mongoose)
  - `docker`: Docker integration
  - `resource`: Code generators
  - ...and more.

## � Plugin Development

### Creating a New Plugin

To add a new capability to `express-tool`, create a new package in `packages/plugins/`:

1.  **Create Directory**: Make a folder `packages/plugins/<plugin-name>`.
2.  **Initialize `package.json`**:
    - Name it `@express-tool/plugin-<name>`.
    - Add `@express-tool/core` as a dependency (use `workspace:*` version).
    - Set `main` to `dist/index.js`, `module` to `dist/index.mjs`, and `types` to `dist/index.d.ts`.
3.  **Implement Plugin Interface**:
    In `src/index.ts`, export a `Plugin` object:

    ```typescript
    import { Plugin, PluginContext } from '@express-tool/core';

    export const myPlugin: Plugin = {
      name: 'my-plugin',
      apply: async (context: PluginContext) => {
        return {
          dependencies: { 'some-lib': 'latest' },
          files: [{ path: 'src/feature.ts', content: '...' }],
        };
      },
    };
    ```

4.  **Register (Optional)**: If this is a core plugin intended to be used by the CLI prompt, you'll need to import and register it in `apps/cli/src/commands/init.generator.ts` and update prompts in `init.prompts.ts`.

### Modifying Plugins

Plugins are standard npm packages within the workspace.

1.  **Edit Code**: Navigate to `packages/plugins/<plugin-name>` and modify `src/index.ts`.
2.  **Build**: Run `pnpm build` from the root or the plugin directory to update the `dist` artifacts.
    - _Tip_: You can run `pnpm build --filter @express-tool/plugin-<name>` to build just one plugin.
3.  **Test**: Run the CLI locally to verify your changes:
    ```bash
    cd apps/cli
    pnpm start init
    ```

## �🧪 Testing

We use Vitest for testing.

```bash
# Run all tests in the monorepo
pnpm test

# Run tests for a specific package
pnpm --filter @express-tool/plugin-auth test
```

## 📦 Publishing

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

1. **Create a Changeset**:
   If you made changes that require a release, run:

   ```bash
   pnpm changeset
   ```

   Select the packages you modified and select the bump type (patch, minor, major).

2. **Publishing**:
   Releases are handled automatically by CI/CD when changesets are merged, or manually via:
   ```bash
   pnpm publish -r --access public
   ```

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

Please ensure `pnpm lint` and `pnpm test` pass before submitting.
