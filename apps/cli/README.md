# 🚀 Express Next CLI

A production-grade Command Line Interface for generating robust, scalable Express.js applications.
`express-next` automates the boring setup, enforcing best practices, modern tooling, and clean architecture from day one.

## ✨ Features

- **Language Support**: First-class TypeScript support (recommended) or modern JavaScript (ES Modules).
- **Architecture**: Choose between **Feature-based** (great for scalability) or Classic **MVC**.
- **Database Integration**:
  - **Prisma ORM**: PostgreSQL, MySQL, MongoDB.
  - **Mongoose**: Native MongoDB support.
- **Authentication**: Built-in simple JWT authentication boilerplate.
- **API Documentation**: Automatic Swagger/OpenAPI options.
- **Package Managers**: Support for `npm`, `pnpm`, `yarn`, and `bun`.
- **Production Ready**:
  - 🐳 Docker & Docker Compose setup included.
  - 🧪 Testing with Vitest + Supertest.
  - 🧹 Linting & Formatting (ESLint + Prettier + Husky).
  - 📝 Structured logging with Pino.

---

## 📦 Installation

Install globally via your preferred package manager:

### npm

```bash
npm install -g express-next
```

### pnpm (Recommended)

```bash
pnpm add -g express-next
```

### Yarn

```bash
yarn global add express-next
```

### Bun

```bash
bun add -g express-next
```

---

## 🛠 Usage

### 1. Initialize a New Project

The `init` command launches an interactive wizard to configure your new application.

```bash
express-next init
```

**Interactive Prompts:**

1. **Project Name**: Name of your project directory (kebab-case).
2. **Language**: `TypeScript` (Recommended) or `JavaScript`.
3. **Architecture**:
   - `Feature-based`: Groups files by domain feature (e.g., `src/modules/users/`).
   - `MVC`: Classic layering (`src/controllers`, `src/routes`, `src/models`).
4. **API Type**:
   - `REST API + Swagger`: Includes setup for auto-generated API docs.
   - `REST API (Basic)`: Simple setup without documentation tools.
5. **Database**:
   - `PostgreSQL (Prisma)`
   - `MySQL (Prisma)`
   - `MongoDB (Prisma)`
   - `MongoDB (Mongoose)`
   - `None`
6. **Package Manager**: Select `npm`, `pnpm`, `yarn`, or `bun`.

---

### 2. Generate Resources (`generate` or `g`)

Quickly scaffold new resources (features) into your existing application. This command respects your project's language (TS/JS).

**Syntax:**

```bash
express-next generate <resource-name>
# or shorcut
express-next g <resource-name>
```

**Example:**

```bash
express-next g blogs
```

**Output:**
This will create the following files (example for a `blogs` feature):

- 📄 `src/controllers/blogs.controller.ts` (CRUD handlers)
- 🛣️ `src/routes/blogs.routes.ts` (Router definition)
- 🧪 `test/blogs.test.ts` (Integration tests)

**After Generation:**
The CLI will print instructions on how to register the new route in your `src/index.ts` (or `app.ts`):

```typescript
import { blogsRouter } from './routes/blogs.routes.js';
app.use('/blogs', blogsRouter);
```

---

### 3. Utility Commands

#### Check Environment

View debugging information about your local environment. useful for reporting issues.

```bash
express-next info
```

#### Update CLI

Check for updates or self-update the CLI tool.

```bash
express-next upgrade
```

---

## 📂 Project Structure

A typical project created with `express-next` looks like this:

```
my-express-app/
├── 🐳 .dockerignore
├── ⚙️ .env
├── ⚙️ .eslintrc.json
├── 🐙 .github/               # CI/CD Workflows
├── 🙈 .gitignore
├── 💅 .prettierrc
├── 🐳 docker-compose.yml
├── 🐳 Dockerfile
├── 📦 package.json
├── 📘 README.md
├── 📐 tsconfig.json          # (If TypeScript)
├── 🧪 vitest.config.ts
├── src/
│   ├── 📁 controllers/       # Route handlers
│   ├── 📁 middleware/        # Custom middleware (auth, validation, error)
│   ├── 📁 models/            # Database models (Mongoose schemas)
│   ├── 📁 routes/            # Route definitions
│   ├── 📁 utils/             # Utility functions and Logger
│   ├── 📄 index.ts           # Application entry point
│   └── 📄 app.test.ts        # App setup tests
└── prisma/                   # (If Prisma selected)
    └── 📄 schema.prisma
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request on our [GitHub Repository](https://github.com/iam-mustak-ak/express-next).

## 📄 License

MIT © Mustak Ahmed Khan
