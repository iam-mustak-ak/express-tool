export const ciWorkflow = `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Lint
        run: pnpm lint
        
      - name: Type Check
        if: \${{ hashFiles('tsconfig.json') != '' }}
        run: pnpm tsc --noEmit
        
      - name: Build
        if: \${{ hashFiles('tsconfig.json') != '' }}
        run: pnpm build

      - name: Test
        run: pnpm test
`;
