# Express Tool (Monorepo)

Welcome to the internal monorepo for **Express Tool** (`@express-tool/cli`), the production-grade CLI for generating robust, scalable Express.js applications.

This repository hosts the source code for the CLI tool, the core framework, and the official plugin ecosystem.

## 🚀 Installation

You can use the tool directly without installation:

```bash
# Using npx (npm)
npx @express-tool/cli init

# Using dlx (pnpm)
pnpm dlx @express-tool/cli init
```

Or install globally:

```bash
# using pnpm (recommended)
pnpm add -g @express-tool/cli

# using npm
npm install -g @express-tool/cli
```

Then run:

```bash
express-tool init
```

## 📂 Repository Structure

The project is managed as a workspace using `pnpm`.

### 📱 Apps

- **[apps/cli](./apps/cli)**: The main `@express-tool/cli` command-line tool.

### 📦 Packages

- **[packages/core](./packages/core)**: Shared core logic (`@express-tool/core`).
- **packages/plugins/**: Official plugins extending the CLI capabilities:
  - **[auth](./packages/plugins/auth)**: Authentication logic.
  - **[database](./packages/plugins/database)**: Database integration.
  - **[resource](./packages/plugins/resource)**: Code generators.
  - **[swagger](./packages/plugins/swagger)**: API documentation.
  - ...and more.

## 🛠 Development

For detailed instructions on setting up the monorepo, building locally, and contributing, please see the **[Development Guide](./DEVELOPMENT.md)**.

### Quick Start (Dev)

```bash
# 1. Install dependencies
pnpm install

# 2. Build all packages
pnpm build

# 3. Run CLI locally
pnpm --filter @express-tool/cli start -- --help
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## 🔐 Security

If you discover a security vulnerability, please see our [Security Policy](SECURITY.md) for instructions on how to urge a report.

## 📄 License

MIT © Mustak Ahmed Khan
