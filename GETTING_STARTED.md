# E-commerce Checkout System - Getting Started

This project implements a complete distributed transaction system using the Orchestration-based Saga pattern with RabbitMQ for an e-commerce checkout flow.

## Architecture Overview

The system consists of 5 microservices:

1. **API Gateway** (Port 3000) - Entry point for client requests
2. **Orchestrator** (Port 3004) - Coordinates the saga workflow and compensation logic
3. **Order Service** (Port 3001) - Manages orders and order items
4. **Inventory Service** (Port 3002) - Handles product inventory with optimistic locking
5. **Payment Service** (Port 3003) - Processes payments with idempotency

## Prerequisites

- Node.js 18+
- PostgreSQL
- Docker (for RabbitMQ)
- pnpm

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start RabbitMQ

```bash
docker-compose up -d rabbitmq
```

RabbitMQ Management UI will be available at http://localhost:15672
- Username: `admin`
- Password: `admin`

### 3. Create Databases

Create the following PostgreSQL databases:

```sql
CREATE DATABASE orders;
CREATE DATABASE inventory;
CREATE DATABASE payments;
CREATE DATABASE orchestrator;
```

### 4. Push Database Schemas

```bash
# Push all database schemas
pnpm --filter=order-service db:push
pnpm --filter=inventory-service db:push
pnpm --filter=payment-service db:push
pnpm --filter=orchestrator db:push
```

### 5. Seed Inventory Data

```bash
pnpm --filter=inventory-service db:seed
```

This will create 10 test products in the inventory database. The product IDs will be displayed in the console.

### 6. Start All Services

```bash
# Start all services in development mode
pnpm dev
```

This will start all 5 services simultaneously using Turborepo.

## Testing the System

### 1. Test Checkout (Happy Path)

Make a POST request to the API Gateway:

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "items": [
      {
        "productId": "660facf7-b9cf-417a-8ee1-27afe2fb2c72",
        "quantity": 2,
        "price": "29.99"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "orderId": "uuid-of-created-order",
  "message": "Order placed successfully"
}
```

### 2. Test Insufficient Inventory (Compensation)

Try to order more items than available:

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "items": [
      {
        "productId": "dda60f33-8dfd-4da2-96c8-1a029d72725a",
        "quantity": 10,
        "price": "19.99"
      }
    ]
  }'
```

This should fail with an error since "Limited Stock Item" only has 5 units.

### 3. Test Payment Failure (Compensation)

The payment service has a 5% failure rate built-in. If a payment fails, the saga will compensate by:
1. Releasing the reserved inventory
2. Cancelling the order

### 4. Test Idempotency

Make the same checkout request twice with the same product. The second request should return the existing reservation/payment without creating duplicates.

## Saga Flow

### Forward Flow (Happy Path)

1. **API Gateway** receives checkout request
2. **Orchestrator** creates saga state and begins coordination
3. **Step 1**: Create order (PENDING status) via Order Service
4. **Step 2**: Reserve inventory via Inventory Service (with optimistic locking)
5. **Step 3**: Process payment via Payment Service (simulated, 95% success rate)
6. **Step 4**: Confirm order (CONFIRMED status) via Order Service
7. **Orchestrator** marks saga as COMPLETED

### Compensation Flow (On Failure)

If any step fails, the orchestrator executes compensation:

- **Payment processed but later step fails** → Refund payment
- **Inventory reserved but later step fails** → Release inventory reservation
- **Order created** → Cancel order (set status to CANCELLED)

## Key Features Implemented

### 1. Orchestration-based Saga Pattern

The Orchestrator service coordinates all distributed transactions and manages compensation logic.

**Location:** `apps/orchestrator/src/saga/saga-orchestrator.service.ts:109-115`

### 2. Idempotency

All operations use `orderId` as a unique constraint to prevent duplicate operations.

**Example in Payment Service:**
- Location: `apps/payment-service/src/payments/payments.service.ts:13-18`

**Example in Inventory Service:**
- Location: `apps/inventory-service/src/inventory/inventory.service.ts:13-18`

### 3. Optimistic Locking

Inventory updates use version-based optimistic locking to prevent overselling during concurrent requests.

**Location:** `apps/inventory-service/src/inventory/inventory.repository.ts:36-52`

### 4. Saga State Tracking

The orchestrator maintains complete audit trails of saga execution:

- `saga_state` table: Current saga state and progress
- `saga_logs` table: Detailed event log for each saga step

**Location:** `apps/orchestrator/src/saga/saga-state.repository.ts:10-23`

### 5. RabbitMQ Message Pattern

Services communicate via RabbitMQ using the request-response pattern:

- Each service listens on a dedicated queue
- Messages are acknowledged only after successful processing
- Supports automatic retries and dead letter queues

**Example in Order Service:**
- Location: `apps/order-service/src/orders/orders.controller.ts:12-16`

## Database Schemas

### Order Service

- `orders` - Order records with status (PENDING, CONFIRMED, CANCELLED)
- `order_items` - Line items for each order

### Inventory Service

- `products` - Product catalog with stock quantity and version (for optimistic locking)
- `reservations` - Temporary inventory reservations tied to orders

### Payment Service

- `payments` - Payment records with status (SUCCESS, FAILED, REFUNDED)

### Orchestrator

- `saga_state` - Current state of each saga
- `saga_logs` - Audit trail of saga events

## Environment Variables

Each service requires a `.env` file:

**Order Service (`apps/order-service/.env`):**
```
PORT=3001
DB_URL=postgresql://postgres:1111@localhost:5432/orders
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

**Inventory Service (`apps/inventory-service/.env`):**
```
PORT=3002
DB_URL=postgresql://postgres:1111@localhost:5432/inventory
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

**Payment Service (`apps/payment-service/.env`):**
```
PORT=3003
DB_URL=postgresql://postgres:1111@localhost:5432/payments
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

**Orchestrator (`apps/orchestrator/.env`):**
```
PORT=3004
DB_URL=postgresql://postgres:1111@localhost:5432/orchestrator
RABBITMQ_URL=amqp://admin:admin@localhost:5672
```

**API Gateway (`apps/api-gateway/.env`):**
```
PORT=3000
ORCHESTRATOR_URL=http://localhost:3004
```

## Monitoring

### RabbitMQ Management UI

Monitor message queues and exchanges:
- URL: http://localhost:15672
- Queues to watch:
  - `order_commands`
  - `inventory_commands`
  - `payment_commands`

### Database Monitoring

You can use Drizzle Studio to inspect databases:

```bash
# For any service, e.g., inventory
pnpm --filter=inventory-service db:studio
```

### Saga Logs

Query the `saga_logs` table in the orchestrator database to see the complete flow of events:

```sql
SELECT * FROM saga_logs WHERE saga_id = 'your-saga-id' ORDER BY created_at;
```

## Troubleshooting

### Service Won't Start

1. Check if the database exists and is accessible
2. Verify RabbitMQ is running: `docker ps`
3. Check for port conflicts

### Orders Not Being Created

1. Verify RabbitMQ queues are created (check Management UI)
2. Check service logs for connection errors
3. Ensure all services are running

### Compensation Not Working

1. Check the `saga_logs` table for error details
2. Verify the orchestrator service is running
3. Review the saga state in `saga_state` table

## Project Structure

```
The/
├── apps/
│   ├── api-gateway/          # REST API entry point
│   ├── orchestrator/         # Saga orchestrator
│   ├── order-service/        # Order management
│   ├── inventory-service/    # Inventory management
│   └── payment-service/      # Payment processing
├── packages/
│   └── shared-types/         # Shared DTOs and types
├── docker-compose.yaml       # RabbitMQ configuration
└── GETTING_STARTED.md       # This file
```

## Next Steps

1. **Add Integration Tests** - Test complete saga flows
2. **Add Unit Tests** - Test individual service methods
3. **Add Monitoring** - Implement distributed tracing (e.g., OpenTelemetry)
4. **Add API Documentation** - Generate Swagger/OpenAPI docs
5. **Production Hardening**:
   - Add retry mechanisms
   - Implement circuit breakers
   - Add rate limiting
   - Configure dead letter queues

## Useful Commands

```bash
# Start all services
pnpm dev

# Build all services
pnpm build

# Run tests (when implemented)
pnpm test

# Seed inventory
pnpm --filter=inventory-service db:seed

# Push database schema
pnpm --filter=order-service db:push
pnpm --filter=inventory-service db:push
pnpm --filter=payment-service db:push
pnpm --filter=orchestrator db:push

# Open Drizzle Studio for a service
pnpm --filter=inventory-service db:studio

# Restart RabbitMQ
docker-compose restart rabbitmq

# View RabbitMQ logs
docker-compose logs -f rabbitmq
```

## Success Criteria

✅ Checkout request creates order, reserves inventory, processes payment, confirms order
✅ Insufficient stock triggers compensation (cancels order, no payment)
✅ Payment failure triggers compensation (releases inventory, cancels order)
✅ Duplicate requests return existing results (idempotency)
✅ Concurrent orders don't oversell inventory (optimistic locking)
✅ All saga steps logged in orchestrator database
✅ All services communicate via RabbitMQ
✅ API Gateway provides clean REST interface

## Support

For issues or questions, refer to:
- CLAUDE.md for architecture details
- Plan file: `~/.claude/plans/elegant-knitting-wand.md`
- RabbitMQ docs: https://www.rabbitmq.com/documentation.html
- Drizzle ORM docs: https://orm.drizzle.team/docs/overview
