# @express-tool/cli

## 1.0.3

### Patch Changes

- Update default TS configuration to use bundler module resolution and tsx/tsup for the build/dev lifecycle.
- Updated dependencies
  - @express-tool/plugin-common@1.0.3

## 1.0.2

### Patch Changes

- Refine all plugin code templates to be production-grade. Add internal environment variable validation, graceful shutdown logic, and security hardening (non-root Docker user, JWT_SECRET production checks). Correct dependency versions and improve ESM compatibility.
- Updated dependencies
  - @express-tool/plugin-auth@1.0.2
  - @express-tool/plugin-common@1.0.2
  - @express-tool/plugin-database@1.0.2
  - @express-tool/plugin-docker@1.0.2
  - @express-tool/plugin-middleware@1.0.2
  - @express-tool/plugin-swagger@1.0.2
  - @express-tool/plugin-resource@1.0.2
  - @express-tool/plugin-testing@1.0.2
  - @express-tool/plugin-ci@1.0.2
  - @express-tool/plugin-quality@1.0.2
  - @express-tool/core@1.0.2
  - @express-tool/plugin-views@1.0.2

## 1.0.1

### Patch Changes

- Optimized project generation, updated dependencies, and added open-source documentation.
- Updated dependencies
  - @express-tool/core@1.0.1
  - @express-tool/plugin-auth@1.0.1
  - @express-tool/plugin-ci@1.0.1
  - @express-tool/plugin-common@1.0.1
  - @express-tool/plugin-database@1.0.1
  - @express-tool/plugin-docker@1.0.1
  - @express-tool/plugin-middleware@1.0.1
  - @express-tool/plugin-quality@1.0.1
  - @express-tool/plugin-resource@1.0.1
  - @express-tool/plugin-swagger@1.0.1
  - @express-tool/plugin-testing@1.0.1
  - @express-tool/plugin-views@1.0.1

## 1.0.0

### Major Changes

- 220071c: chore: Update publishing metadata (repository, license, exports) for all plugins.
- f22ed9c: Changes the naming
- 568eb81: - Fixed missing `exports` fields in `plugin-resource`, `plugin-testing`, and `plugin-auth` to ensure types are correctly resolved.

### Minor Changes

- feats: Introduced professional native Prisma CLI integration for database initialization, support for Prisma Postgres (Managed), driver adapter pattern for PostgreSQL, and removal of legacy MongoDB Prisma implementation.

### Patch Changes

- Updated dependencies [220071c]
- Updated dependencies
- Updated dependencies [f22ed9c]
  - @express-tool/core@1.0.0
  - @express-tool/plugin-auth@1.0.0
  - @express-tool/plugin-ci@1.0.0
  - @express-tool/plugin-common@1.0.0
  - @express-tool/plugin-database@1.0.0
  - @express-tool/plugin-docker@1.0.0
  - @express-tool/plugin-middleware@1.0.0
  - @express-tool/plugin-quality@1.0.0
  - @express-tool/plugin-resource@1.0.0
  - @express-tool/plugin-swagger@1.0.0
  - @express-tool/plugin-testing@1.0.0
  - @express-tool/plugin-views@1.0.0
