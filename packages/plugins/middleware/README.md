# Express Tool Middleware Plugin

This plugin provides additional specialized middleware for `express-tool` applications, primarily focusing on request validation using Zod.

## Installation

Installed automatically when validation features are needed. Manual install:

```bash
npm install @express-tool/plugin-middleware
```

## Features

- **Zod Validation**: A generic validation middleware factory that validates `body`, `query`, and `params` against Zod schemas.
- **Type Safety**: Ensures request data matches your schema definition before reaching controllers.

## Usage

Generates `middleware/validate.ts`. Import and use it in your routes:

```typescript
import { validate } from './middleware/validate';
import { someSchema } from './schemas';

router.post('/', validate(someSchema), controller.create);
```

## License

MIT
