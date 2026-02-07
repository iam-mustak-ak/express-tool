# Express Tool Core

The core package for `express-tool` provides the foundational architecture and plugin system interfaces for building modular Express.js applications. It defines the `Plugin` and `PluginContext` types that all other plugins in the `express-tool` ecosystem adhere to.

## Installation

This package is typically used internally by `@express-tool/cli` and other plugins, but can be installed manually:

```bash
npm install @express-tool/core
```

## Features

- **Plugin Interface Definition**: Standardizes how plugins are structured (dependencies, devDependencies, files, env vars, etc.).
- **Common Types**: Shared TypeScript types for context passing.

## Usage

If you are developing a custom plugin for `express-tool`:

```typescript
import { Plugin, PluginContext } from '@express-tool/core';

export const myPlugin: Plugin = {
  name: 'my-custom-plugin',
  apply: async (context: PluginContext) => {
    return {
      dependencies: {
        'some-package': 'latest',
      },
      files: [
        {
          path: 'src/utils/myUtil.ts',
          content: 'export const ...',
        },
      ],
    };
  },
};
```

## License

MIT
