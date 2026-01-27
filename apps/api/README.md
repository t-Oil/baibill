# NestJS Starter Template

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A production-ready NestJS starter template with TypeORM, PostgreSQL, JWT Authentication, RBAC, and migration system.</p>

## Description

Enterprise-grade NestJS application template featuring:

- ✅ **TypeORM** with PostgreSQL/MySQL support
- ✅ **Migration-first approach** (no synchronize in production)
- ✅ **JWT Authentication** with refresh tokens
- ✅ **Role-Based Access Control (RBAC)**
- ✅ **Custom Repository Pattern**
- ✅ **Database Seeding**
- ✅ **Swagger API Documentation**
- ✅ **Unit & E2E Testing**
- ✅ **ESLint & Prettier**
- ✅ **Docker Support**

## Tech Stack

- **Framework**: NestJS v11
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL / MySQL
- **ORM**: TypeORM v0.3
- **Authentication**: JWT + Passport
- **Validation**: class-validator & class-transformer
- **Testing**: Jest
- **API Docs**: Swagger/OpenAPI

---

## Prerequisites

- Node.js >= 20.0.0

---

## Getting Started

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd nestjs-template

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env
```
### 3. Run Migrations

```bash
# Run all pending migrations
npm run migration:run

# Check migration status
npm run migration:show
```

### 4. Seed Database (Optional)

```bash
# Run database seeders
npm run seed
```

This will populate the database with:
- Default roles
- Default permissions
- Sample users
- Test data

### 5. Start the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will start at: `http://localhost:3000`

### 6. Access API Documentation

Once the app is running, visit:

**Swagger UI**: `http://localhost:3000/api/docs`

---

## Available Scripts

### Development

```bash
# Start with hot-reload
npm run start:dev

# Start with debug mode
npm run start:debug

# Format code
npm run format

# Lint code
npm run lint
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

### Database Migrations

```bash
# Create a new empty migration
npm run migration:create src/db/migrations/MigrationName

# Generate migration from entity changes (auto-detect)
npm run migration:generate src/db/migrations/MigrationName

# Run all pending migrations
npm run migration:run

# Rollback last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Drop entire schema (DANGER!)
npm run schema:drop
```

### Database Seeding

```bash
# Run all seeders
npm run seed
```

### Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Debug tests
npm run test:debug
```
---

## Project Structure

```
src/
├── commons/                 # Shared utilities & resources
│   ├── decorators/         # Custom decorators
│   ├── enums/              # Enums (ActiveStatus, Permissions)
│   ├── guards/             # Auth & role guards
│   ├── requests/           # Shared DTOs
│   ├── resources/          # Response transformers
│   └── validators/         # Custom validators
├── configs/                # Configuration files
│   └── typeorm/           # TypeORM config & data source
├── db/                     # Database files
│   ├── migrations/        # Migration files
│   └── seeds/             # Seeder files
├── entities/              # TypeORM entities (database models)
├── exceptions/            # Custom exceptions & filters
├── interceptors/          # Global interceptors
├── modules/               # Feature modules
│   ├── app/              # Root application module
│   ├── auth/             # Authentication module
│   ├── user/             # User management
│   ├── role/             # Role management (RBAC)
│   ├── logger/           # Logging service
│   └── master/           # Master data (departments, etc.)
├── repositories/          # Custom TypeORM repositories
└── main.ts               # Application entry point
```

---

## Module Structure

Each feature module follows this structure:

```
modules/user/
├── user.module.ts          # Module definition
├── controllers/            # HTTP endpoints
│   └── user.controller.ts
├── services/              # Business logic
│   └── user.service.ts
├── requests/              # Input DTOs
│   ├── create-user.request.ts
│   └── update-user.request.ts
└── resources/             # Output transformers
    └── user.resource.ts
```


## Testing

### Unit Tests

Unit tests are located alongside the source files with `.spec.ts` extension:

```bash
# Run all unit tests
npm run test

# Run tests for specific module
npm run test -- user.service.spec.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

### E2E Tests

End-to-end tests are in the `test/` directory:

```bash
# Run all e2e tests
npm run test:e2e

# Run specific e2e test
npm run test:e2e -- auth.e2e-spec.ts
```
---

### Health Check

The application exposes a health check endpoint:

```bash
curl http://localhost:3000/health
```
