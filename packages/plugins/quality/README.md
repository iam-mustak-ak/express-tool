# Express Tool Quality Plugin

The Quality plugin enforces code standards and consistency in `express-tool` projects. It sets up ESLint, Prettier, Husky hooks, and lint-staged to ensure high code quality.

## Installation

Included by default in robust project setups. Manual install:

```bash
npm install @express-tool/plugin-quality
```

## Features

- **ESLint**: Configured with recommended rules (and TypeScript support if applicable).
- **Prettier**: Opinionated code formatting.
- **Git Hooks**: Husky and lint-staged configuration to automatically format and lint staged files before commit.

## Usage

Run these scripts (automatically added to package.json):

```bash
npm run lint    # Check for lint errors
npm run format  # Format code with Prettier
```

## License

MIT
