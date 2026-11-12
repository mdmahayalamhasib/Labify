# Labify API

Labify is a NestJS REST API for managing projects, milestones, tasks, equipment, equipment rules, maintenance tickets, and credit ledger records. It uses PostgreSQL with TypeORM and Redis for the Bull queue connection.

## Requirements

- Node.js 20 or newer
- npm (the repository includes `package-lock.json`)
- PostgreSQL
- Redis

## Local setup

1. Install dependencies and create your local environment file:

   ```bash
   npm ci
   cp .env.example .env
   ```

2. Edit `.env` with your local PostgreSQL, Redis, and SMTP settings. The example values target local services. `JWT_BEARER_SECRET` and `COOKIE_SECRET` are development placeholders; replace them with private random values outside local development.

3. Create the database configured by `DB_DATABASE` (default: `labify_db`). For example, with PostgreSQL tools installed:

   ```bash
   createdb labify_db
   ```

4. Apply the TypeORM migrations:

   ```bash
   npm run migration:run
   ```

5. Start the API in watch mode:

   ```bash
   npm run start:dev
   ```

The API listens on `http://localhost:5000` by default. Swagger documentation is available at [http://localhost:5000/api](http://localhost:5000/api), and the health endpoint is [http://localhost:5000/health](http://localhost:5000/health).

## API areas

The current controllers expose these resource paths:

- `/projects`
- `/milestones`
- `/tasks`
- `/credits`
- `/equipment`
- `/equipment-rules`
- `/maintenance-tickets`

Most resources support create, list, read by ID, update, and delete operations. See Swagger for request and response schemas. List endpoints accept `page` and `limit`; equipment and maintenance endpoints also support their controller-defined filters.

## Other commands

```bash
npm run build              # Compile to dist/
npm run start:prod         # Run the compiled API
npm run migration:rollback # Revert the latest migration
npm run migration:rollbackAll
npm run seeder:run:dev     # Run development seeders (currently no seeders are registered)
```

The production entry point is `dist/main.js`. Docker files are included, but the current Dockerfile expects a `pnpm-lock.yaml`, which is not present in this repository; use the npm commands above unless that lockfile is added.

## Project layout

```text
src/
  config/       Application and PostgreSQL configuration
  database/     TypeORM data source and migrations
  modules/      Projects, milestones, tasks, credits, equipment, and maintenance
  providers/    PostgreSQL and Redis integrations
  common/       Shared guards, decorators, enums, and utilities
  main.ts       HTTP server, middleware, CORS, and Swagger setup
```
