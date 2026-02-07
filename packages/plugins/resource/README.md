# Express Tool Resource Plugin

The Resource plugin allows for the rapid generation of RESTful resources (CRUD operations) within an `express-tool` project. It generates controllers, routes, and tests for new entities.

## Installation

This is primarily a CLI utility plugin used by the `generate` command.

```bash
npm install @express-tool/plugin-resource
```

## Features

- **Scaffolding**: Generates Controller, Router, and Test files for a given resource name.
- **REST Best Practices**: Implements standard GET, POST, PUT, DELETE operations.
- **Type Safe**: Generates typed handlers for TypeScript projects.

## Usage

Used via the CLI:
`express-tool generate resource <name>`

## License

MIT
