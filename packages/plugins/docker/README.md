# Express Tool Docker Plugin

The Docker plugin containerizes your `express-tool` application. It generates a production-ready `Dockerfile` and a `docker-compose.yml` for local development orchestration, including database services.

## Installation

This plugin is optional during the `express-tool` init process. To install manually:

```bash
npm install @express-tool/plugin-docker
```

## Features

- **Production Dockerfile**: Multi-stage build for optimized image size (base, deps, builder, runner).
- **Docker Compose**: Orchestrates your app and selected database (Postgres, Mongo, etc.) for seamless local dev.
- **Package Manager Agnostic**: correctly configures build steps for npm, pnpm, yarn, or bun.

## Usage

To start your app and database:

```bash
docker-compose up -d
```

## License

MIT
