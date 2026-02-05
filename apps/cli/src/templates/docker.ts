export const dockerfile = (isTs: boolean) => `FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm i --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
${isTs ? 'RUN npm install -g pnpm && pnpm run build' : ''}

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
${isTs ? 'COPY --from=builder /app/dist ./dist' : 'COPY --from=builder /app/src ./src'}
${isTs ? '' : 'COPY --from=builder /app/src ./src'} 

EXPOSE 3000

CMD ["node", "${isTs ? 'dist/index.js' : 'src/index.js'}"]
`;

export const dockerCompose = (dbType: 'postgresql' | 'mysql' | 'none') => {
  if (dbType === 'none') {
    return `version: '3'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
`;
  }

  const dbImage = dbType === 'postgresql' ? 'postgres:15-alpine' : 'mysql:8.0';
  const dbPort = dbType === 'postgresql' ? '5432' : '3306';
  const dbEnv =
    dbType === 'postgresql'
      ? `POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp`
      : `MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: myapp
      MYSQL_USER: user
      MYSQL_PASSWORD: password`;

  return `version: '3'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=${dbType}://user:password@db:${dbPort}/myapp?schema=public
      - NODE_ENV=development
    depends_on:
      - db

  db:
    image: ${dbImage}
    ports:
      - '${dbPort}:${dbPort}'
    environment:
      ${dbEnv}
    volumes:
      - db_data:/var/lib/${dbType === 'postgresql' ? 'postgresql/data' : 'mysql'}

volumes:
  db_data:
`;
};
