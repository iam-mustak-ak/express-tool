# Express Tool Swagger Plugin

This plugin adds automatic API documentation to your `express-tool` project using OpenAL (Swagger) and `zod-to-openapi`.

## Installation

Select "REST API with Swagger" during initialization. Manual install:

```bash
npm install @express-tool/plugin-swagger
```

## Features

- **Auto-generated Docs**: Generates OpenAPI 3.0 spec from your Zod schemas.
- **Swagger UI**: Serves interactive API documentation at `/docs`.
- **Registry Pattern**: Centralized registry for defining schemas and routes.

## Usage

Visit `http://localhost:3000/docs` to see your API documentation.
Define schemas in `docs/registry.ts` (or wherever your registry is initialized) to include them in the documentation.

## License

MIT
