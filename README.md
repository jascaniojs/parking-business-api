# Parking Business API

A NestJS-based API for parking business management, following Domain-Driven Design principles and clean architecture patterns.

## Tech Stack

- **NestJS** v11+ - Progressive Node.js framework
- **TypeScript** v5+ - Type-safe development
- **PostgreSQL** v16+ - Relational database
- **TypeORM** v0.3+ - ORM for database operations
- **Docker** - Local PostgreSQL setup
- **JWT** - Token-based authentication
- **Swagger** - API documentation

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start PostgreSQL with Docker:
```bash
docker-compose up -d
```

3. Create and run database migrations:
```bash
# Generate initial migration
npm run migration:generate -- src/database/migrations/InitialSchema

# Run migrations
npm run migration:run
```

4. Seed the database with test users:
```bash
npm run seed
```

This will create a `users.json` file with JWT tokens for authentication.

### Development

Start the development server:
```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs

### Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run test:cov` - Run tests with coverage

### Database Scripts

- `npm run migration:generate -- src/database/migrations/<name>` - Generate migration from entities
- `npm run migration:create -- src/database/migrations/<name>` - Create empty migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run seed` - Seed database with test data

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── domain/             # User domain entity
│   ├── infrastructure/     # User repository & ORM entity
│   └── interface/          # JWT strategy, guards, decorators
├── shared/                 # Shared infrastructure
│   ├── config/            # Configuration files
│   ├── filters/           # Global exception filters
│   └── decorators/        # Custom decorators
├── database/              # Database related
│   ├── migrations/        # TypeORM migrations
│   └── seeds/            # Database seeders
└── main.ts               # Application entry point
```

## Authentication

This API uses pre-seeded JWT authentication. After running `npm run seed`, tokens are saved in `users.json`.

### Using Authentication

Include the JWT token in the Authorization header:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/endpoint
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=parking_dev

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```
