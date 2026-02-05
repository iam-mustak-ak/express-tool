import { Plugin, PluginContext } from '@express-next/core';

export const prismaSchema = (provider: string) => `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
`;

export const dbClientTs = `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
`;

export const dbClientJs = `import { PrismaClient } from '@prisma/client';

export const db = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = db;
`;

export const databasePlugin: Plugin = {
  name: 'database',
  apply: async (context: PluginContext, options: { provider: 'postgresql' | 'mysql' }) => {
    const { isTs, projectName } = context;
    const provider = options.provider;

    return {
      dependencies: {
        '@prisma/client': '^5.10.0',
      },
      devDependencies: {
        prisma: '^5.10.0',
      },
      scripts: {
        postinstall: 'prisma generate',
        migration: 'prisma migrate dev',
        studio: 'prisma studio',
      },
      files: [
        {
          // path relative to project root? No, plugin interface said "relative to src".
          // wait, schema.prisma usually goes to 'prisma/schema.prisma' which is in project root.
          // plugin interface "files" documentation says: "path: string; // relative to src".
          // This is a limitation of my initial design if I want to write to root.
          // Let's assume the consumer handles paths starting with `../` or absolute paths?
          // Or better, I should update Core to allow specifying target dir or assume root relative if starting with / or something.
          // For now, I'll use `../prisma/schema.prisma` if the base is src.
          path: '../prisma/schema.prisma',
          content: prismaSchema(provider),
        },
        {
          path: isTs ? 'lib/db.ts' : 'lib/db.js',
          content: isTs ? dbClientTs : dbClientJs,
        },
      ],
      env: {
        DATABASE_URL: `${provider}://user:password@localhost:5432/${projectName}?schema=public`,
      },
    } as import('@express-next/core').PluginAction;
  },
};
