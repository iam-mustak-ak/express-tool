# Express Tool CI Plugin

The CI plugin sets up Continuous Integration workflows for your `express-tool` project. It currently supports GitHub Actions, automatically configuring workflows for linting, testing, and building your application on every push and pull request.

## Installation

This plugin is selected during project initialization with `express-tool`. To install manually:

```bash
npm install @express-tool/plugin-ci
```

## Features

- **GitHub Actions Workflow**: Generates `.github/workflows/ci.yml`.
- **Automated Checks**: Runs linting, type checking (for TS), and tests coverage.
- **Multi-Package Manager Support**: Configures workflow steps based on your chosen package manager (npm, pnpm, yarn, bun).

## Usage

Once installed, pushes to `main` or pull requests will trigger the CI pipeline defined in `.github/workflows/ci.yml`.

## License

MIT
