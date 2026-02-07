# Express Tool Database Plugin

This plugin integrates database connectivity into your `express-tool` application. It supports multiple database providers and ORMs, including MongoDB (Mongoose) and SQL databases (PostgreSQL, MySQL, SQLite) via Prisma.

## Installation

Select your preferred database option during project creation. To use manually:

```bash
npm install @express-tool/plugin-database
```

## Features

- **MongoDB (Mongoose)**: Robust setup with connection logic and example models.
- **Prisma (SQL/NoSQL)**: Modern ORM setup with schema generation, client instantiation, and migration scripts.
- **Environment Configuration**: Automatically configures `DATABASE_URL` in `.env`.

## Supported Databases

- MongoDB (via Mongoose or Prisma)
- PostgreSQL (via Prisma)
- MySQL (via Prisma)
- SQLite (via Prisma)

## License

MIT
