# Express Next Monorepo

Welcome to the internal monorepo for **Express Next**, the production-grade CLI for generating robust, scalable Express.js applications.

This repository hosts the source code for the CLI tool, the core framework, and the official plugin ecosystem.

## 📂 Repository Structure

The project is managed as a workspace using `pnpm`.

### 📱 Apps

- **[apps/cli](./apps/cli)**: The main `express-next` command-line tool that users install.

### 📦 Packages

- **[packages/core](./packages/core)**: Shared core logic, types, and utilities used by the CLI and plugins.
- **packages/plugins/**: Collection of official plugins that extend the capabilities of generated projects:
  - **[auth](./packages/plugins/auth)**: Authentication logic.
  - **[database](./packages/plugins/database)**: Database integration resources.
  - **[resource](./packages/plugins/resource)**: Generators for Controllers, Routes, and Tests.
  - **[swagger](./packages/plugins/swagger)**: API documentation generation.
  - **[testing](./packages/plugins/testing)**: Test setup and utilities.
  - _...and more._

## 🚀 Getting Started

If you are looking to **use** the tool, please refer to the [CLI Documentation](./apps/cli/README.md).

If you are a **contributor** helping to develop the framework:

### Prerequisites

- **Node.js**: v18+
- **pnpm**: v9+

### Setup

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Build All Packages**

   ```bash
   pnpm build
   ```

   This uses [Turbo Repo](https://turbo.build/) to cache and build packages in the correct dependency order.

## 🛠 Development

For detailed instructions on running and debugging the CLI locally, see the [Development Guide](./apps/cli/DEVELOPMENT.md).

## 🤝 Contributing

We welcome contributions! Please see the issue tracker to find something to work on.

## 📄 License

MIT © Mustak Ahmed Khan
