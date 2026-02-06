import { Plugin, PluginContext } from '@express-tool/core';

export const loggerTs = `import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});
`;

export const loggerJs = `import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});
`;

export const errorHandlerTs = `import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  logger.error(err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
`;

export const errorHandlerJs = `import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  logger.error(err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
`;

export const commonPlugin: Plugin = {
  name: 'common',
  apply: async (context: PluginContext) => {
    const { isTs } = context;

    return {
      dependencies: {
        pino: '^8.19.0',
        'pino-http': '^9.0.0',
        helmet: '^7.1.0',
        cors: '^2.8.5',
        'express-rate-limit': '^7.2.0',
        dotenv: '^16.4.5',
      },
      devDependencies: {
        'pino-pretty': '^10.3.1',
        '@types/cors': '^2.8.17',
        '@types/express': '^4.17.21',
        '@types/node': '^20.11.0',
        '@types/express-rate-limit': '^6.0.0',
        tsx: '^4.7.1',
      },
      files: [
        {
          path: isTs ? 'utils/logger.ts' : 'utils/logger.js',
          content: isTs ? loggerTs : loggerJs,
        },
        {
          path: isTs ? 'middleware/errorHandler.ts' : 'middleware/errorHandler.js',
          content: isTs ? errorHandlerTs : errorHandlerJs,
        },
      ],
      env: {
        LOG_LEVEL: 'info',
        PORT: '3000',
        NODE_ENV: 'development',
      },
    } as import('@express-tool/core').PluginAction;
  },
};
