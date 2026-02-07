# Express Tool Auth Plugin

This plugin adds robust authentication capabilities to your `express-tool` project, supporting JSON Web Tokens (JWT) out of the box. It scaffolds secure authentication middleware, routes, and utilities.

## Installation

This plugin is automatically included when you select authentication options via the `express-tool` CLI. To install manually:

```bash
npm install @express-tool/plugin-auth
```

## Features

- **JWT Authentication**: Secure token-based authentication setup.
- **Middleware**: `authenticateToken` middleware to protect routes.
- **Routes**: Ready-to-use `/auth/login` and other auth endpoints.
- **TypeScript Support**: Full type definitions for user payloads and request extensions.

## Usage

When applied, this plugin generates:

- `middleware/auth.ts`: Middleware to verify JWTs.
- `routes/auth.ts`: Authentication routes.

## License

MIT
