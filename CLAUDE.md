# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a microservices-based order processing system built with NestJS and managed as a Turborepo monorepo. The architecture implements the Saga pattern for distributed transactions across multiple services.

## Key Commands

### Monorepo Management (via Turborepo)

```bash
# Build all services
pnpm build

# Run all services in development mode
pnpm dev

# Run specific service in development
pnpm --filter=order-service dev
pnpm --filter=api-gateway dev

# Lint all services
pnpm lint

# Type check all services
pnpm check-types

# Format code across the monorepo
pnpm format
```

### Individual Service Commands

Each microservice (api-gateway, orchestrator, order-service, inventory-service, payment-service) supports:

```bash
# From within a service directory (e.g., apps/order-service/):
pnpm start:dev          # Run in watch mode
pnpm start:debug        # Run with debugging
pnpm test               # Run unit tests
pnpm test:watch         # Run tests in watch mode
pnpm test:cov           # Run tests with coverage
pnpm test:e2e           # Run e2e tests
```

## Architecture

### Microservices

The system consists of five NestJS microservices:

1. **api-gateway**: Entry point for client requests
2. **orchestrator**: Coordinates distributed transactions using Saga pattern
3. **order-service**: Manages orders and order items (uses Drizzle ORM + PostgreSQL)
4. **inventory-service**: Manages product inventory and reservations
5. **payment-service**: Handles payment processing

### Database Architecture

The system uses PostgreSQL with separate databases/schemas for each service:

- **Order Service**: `orders` and `order_items` tables with saga_state tracking
- **Inventory Service**: `products` with optimistic locking (version field) and `reservations` for inventory holds
- **Payment Service**: `payments` table with idempotency via unique order_id constraint
- **Orchestrator** (optional): `saga_logs` and `saga_state` for tracking distributed transaction progress

Refer to `erd.sql` for complete database schema.

### Saga Pattern Implementation

The orchestrator implements the Saga pattern for distributed transactions:
- Each service maintains its own saga state
- Idempotency is enforced through unique constraints (order_id in reservations and payments)
- Compensating transactions handle rollback scenarios
- The order service tracks saga progress via the `saga_state` field

### Technology Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7+
- **ORM**: Drizzle ORM (order-service, uses node-postgres driver)
- **Database**: PostgreSQL
- **Monorepo**: Turborepo with pnpm workspaces
- **Testing**: Jest with ts-jest
- **Linting**: ESLint 9 with Prettier

### Shared Packages

Located in `packages/`:
- `@repo/ui`: Shared React components
- `@repo/eslint-config`: ESLint configurations
- `@repo/typescript-config`: Shared TypeScript configs

## Database Setup (Order Service Example)

The order-service uses Drizzle ORM. Database connection is configured via environment variables:

```
DB_URL=postgresql://user:password@host:port/database?sslmode=require
```

Database schema is defined in `apps/order-service/src/db/schema.ts`.

## Development Workflow

1. Install dependencies: `pnpm install`
2. Set up environment variables in each service (`.env` files)
3. Run database migrations if needed
4. Start all services: `pnpm dev` or individual services with filters
5. Services run on PORT environment variable (defaults to 3000)

## Important Patterns

### Service Communication
Services communicate via HTTP/REST. The orchestrator coordinates multi-service operations.

### Error Handling & Idempotency
- All inter-service operations must be idempotent
- Use unique constraints (order_id) to prevent duplicate operations
- Implement compensating transactions for rollback scenarios

### Optimistic Locking
The inventory service uses version-based optimistic locking on the `products` table to prevent race conditions during concurrent updates.
