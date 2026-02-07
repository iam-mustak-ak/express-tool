import { Plugin, PluginContext } from '@express-tool/core';

export const prismaSchema = (provider: string) => {
  const isMongo = provider === 'mongodb';

  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

// Example model
model User {
  id        ${isMongo ? 'String   @id @default(auto()) @map("_id") @db.ObjectId' : 'String   @id @default(cuid())'}
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
};

export const dbClientTs = `import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
`;

export const dbClientJs = `import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
`;

export const prismaConfigTs = `import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
  },
});
`;

export const postgresAdapterClientTs = `import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = \`\${process.env.DATABASE_URL}\`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
`;

export const postgresAdapterClientJs = `import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = \`\${process.env.DATABASE_URL}\`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
`;

export const mongooseClientTs = `import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL || '');
    logger.info(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    logger.error(\`Error: \${(error as Error).message}\`);
    process.exit(1);
  }
};
`;

export const mongooseClientJs = `import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL || '');
    logger.info(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    logger.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};
`;

export const mongooseModelTs = `import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
`;

export const mongooseModelJs = `import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
}, {
  timestamps: true
});

export default mongoose.model('User', UserSchema);
`;

export const databasePlugin: Plugin = {
  name: 'database',
  apply: async (context: PluginContext, options: { database: string }) => {
    const { isTs, projectName } = context;
    const { database } = options;

    if (database === 'mongodb') {
      return {
        dependencies: {
          mongoose: 'latest',
        },
        files: [
          {
            path: isTs ? 'lib/db.ts' : 'lib/db.js',
            content: isTs ? mongooseClientTs : mongooseClientJs,
          },
          {
            path: isTs ? 'models/User.ts' : 'models/User.js',
            content: isTs ? mongooseModelTs : mongooseModelJs,
          },
        ],
        env: {
          DATABASE_URL: `mongodb://localhost:27017/${projectName}`,
        },
      } as import('@express-tool/core').PluginAction;
    }

    if (database === 'prisma-postgres' || database === 'postgresql') {
      const isPrismaPostgres = database === 'prisma-postgres';
      const scripts: any = {
        postinstall: 'prisma generate',
        migration: 'prisma migrate dev',
        studio: 'prisma studio',
      };

      const initCommand = isPrismaPostgres
        ? 'npx prisma init --db'
        : 'npx prisma init --datasource-provider postgresql';

      return {
        dependencies: {
          '@prisma/client': 'latest',
          '@prisma/adapter-pg': 'latest',
          pg: 'latest',
          dotenv: 'latest',
        },
        devDependencies: {
          prisma: 'latest',
          '@types/pg': 'latest',
        },
        scripts,
        commands: [initCommand],
        files: [
          {
            path: isTs ? 'lib/db.ts' : 'lib/db.js',
            content: isTs ? postgresAdapterClientTs : postgresAdapterClientJs,
          },
        ],
        // Env vars will be generated by prisma init in .env, but we might want to append or merge?
        // usage of prisma init creates a .env file. The CLI also creates a .env file.
        // We need to be careful about not overwriting or being overwritten.
        // The CLI writes .env at the end of `generateBaseApp`.
        // If we run `prisma init`, it might complain if .env exists, or append.
        // We should probably run this command *after* everything? or *during*?
      } as any; // Using any to bypass type check until core is updated, or cast to updated type
    }

    const provider = database;
    const dbUrl =
      provider === 'sqlite'
        ? `file:./dev.db`
        : `${provider}://user:password@localhost:5432/${projectName}?schema=public`;

    return {
      dependencies: {
        '@prisma/client': 'latest',
      },
      devDependencies: {
        prisma: 'latest',
      },
      scripts: {
        postinstall: 'prisma generate',
        migration: 'prisma migrate dev',
        studio: 'prisma studio',
      },
      files: [
        {
          path: '../prisma/schema.prisma',
          content: prismaSchema(provider),
        },
        {
          path: isTs ? 'lib/db.ts' : 'lib/db.js',
          content: isTs ? dbClientTs : dbClientJs,
        },
      ],
      env: {
        DATABASE_URL: dbUrl,
      },
    } as import('@express-tool/core').PluginAction;
  },
};
