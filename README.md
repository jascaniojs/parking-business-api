# Parking Business API

Parking space management system with real-time occupation tracking and session history analytics.

## Stack

- **Backend:** NestJS v11+ + TypeScript v5+
- **Database:** PostgreSQL v16+ with TypeORM v0.3+
- **Infrastructure:** Docker (local development)
- **Auth:** JWT with Passport
- **Views:** Handlebars (dashboard UI)
- **Docs:** Swagger/OpenAPI

## Project Structure

```
├── src/                    # Application code
├── test/                   # E2E tests + helpers
├── views/                  # Handlebars templates
└── scripts/                # Seed scripts
```

## Architecture

Domain-Driven Design organized by feature:

```
src/
├── auth/                   # Authentication & users
├── parking-sessions/       # Session management (check-in/out, history)
├── parking-spaces/         # Space management & occupation tracking
├── buildings/              # Building management
├── prices/                 # Pricing rules
└── shared/                 # Infrastructur
```
Each domain follows:
- `domain/` - Business logic & entities
- `infrastructure/` - TypeORM repositories
- `interface/` - REST controllers & DTOs

## Local Development

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- npm or yarn

### Setup
#### Quick Start
```bash
npm run start:init
```
#### Manual Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL
docker compose up -d

# Run migrations
npm run migration:run

# Seed test users
npm run seed
```

API runs at http://localhost:3000

### Test Data
#### Test Users
After seeding, tokens are saved in `users.json`:
- **Admin:** `admin@parking.com` (access to history endpoint)
- **User:** `user@parking.com`
#### Test Buildings
After seeding, buildings are saved in `buildings.json`:
- Use building id's in requests when needed.

### Testing

```bash
npm test                    # Unit tests
npm run test:cov           # Coverage report
npm run test:e2e           # E2E tests
npm run test:watch         # Watch mode
```

## API Endpoints

### Parking Sessions
- `POST /parking-sessions/check-in` - Start parking session (auth required)
- `POST /parking-sessions/check-out` - End session and calculate charge (auth required)
- `GET /parking-sessions/history` - Session history with pagination (admin only)

### Parking Spaces
- `GET /parking-spaces/occupation` - Real-time occupation status (auth required)
- `GET /parking-spaces/dashboard/:buildingId` - Visual dashboard (public, HTML)

**Authentication:** All endpoints except dashboard require JWT token in `Authorization: Bearer <token>` header. Get tokens from `users.json` after running `npm run seed`.

**Swagger Docs:** http://localhost:3000/api/docs

**Postman:** Import OpenAPI spec from http://localhost:3000/api/docs-json into Postman for manual testing

## Scripts

### Development
```bash
npm run start:dev          # Dev server with hot reload
npm run build              # Build application
npm run start:prod         # Production server
npm run lint               # Lint code
npm run format             # Format with Prettier
```

### Database
```bash
npm run migration:generate -- src/database/migrations/<name>
npm run migration:create -- src/database/migrations/<name>
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration
npm run migration:show     # Show migration status
npm run seed               # Seed test users
```

### Testing
```bash
npm test                   # Unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # E2E tests
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=parking_dev

# Authentication
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# API Documentation
SWAGGER_ENABLED=true
```
