# 🛠️ Development Guide for Express Tool

Welcome to the development guide for **Express Tool** (`@express-tool`). This guide will help you set up the monorepo, build the packages, and contribute to the CLI and plugins.

## 📋 Prerequisites

- **Node.js**: v20 or higher (Required for some dev tools)
- **pnpm**: v9 or higher (Strictly required for workspace management)

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

## 🧪 Testing

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
