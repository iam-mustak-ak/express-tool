# 🛠️ Development Guide for Express Tool CLI

This guide will help you set up your environment to develop and test the **Express Tool CLI** locally.

## Prerequisities

- **Node.js**: v18 or higher
- **pnpm**: v9 or higher (Recommended package manager)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/iam-mustak-ak/express-next.git
cd express-next
```

### 2. Install Dependencies

We use `pnpm` workspace for managing the monorepo.

```bash
pnpm install
```

### 3. Build the Project

You need to build the packages (core, plugins, etc.) before running the CLI.

```bash
pnpm build
```

This will run `turbo build` and compile all packages in the correct order.

## 🏃 Running the CLI Locally

There are two ways to run the CLI during development:

### Option A: Using `npm start` (Recommended)

You can run the CLI directly from the source (compiled dist) without installing it globally.

```bash
cd apps/cli

# Run help
pnpm start -- --help

# Generate a new project
pnpm start -- init
```

### Option B: Using `npm link`

To enable the `express-tool` command globally on your machine pointing to your local source:

1. Link the package:

   ```bash
   cd apps/cli
   npm link
   ```

2. Run the command anywhere:

   ```bash
   express-tool --help
   ```

3. Unlink when done:
   ```bash
   npm unlink -g @express-tool/cli
   ```

## ⚡ Development Workflow

When working on the CLI code (`apps/cli/src`):

1. **Watch Mode**: Run the build in watch mode to automatically recompile on changes.

   ```bash
   cd apps/cli
   pnpm run dev
   ```

2. **Test Changes**: Open a new terminal and run your command.
   ```bash
   pnpm start -- <command>
   ```

## 🐛 Debugging

To verify that the CLI is running correctly and picking up your changes:

```bash
pnpm start -- info
```

This will verify the environment and versions.

## 🏗️ Project Structure

- **`apps/cli`**: The main CLI entry point and commands.
- **`packages/core`**: Core logic shared across plugins.
- **`packages/plugins/*`**: Individual features (auth, database, etc.) implemented as plugins.

## 🧪 Testing

We use Vitest for testing.

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter @express-tool/plugin-auth
```
