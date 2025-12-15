-- ============================================================
-- ================ ORDER SERVICE TABLES =======================
-- ============================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',        -- PENDING, CONFIRMED, CANCELLED
    saga_state VARCHAR(50) DEFAULT 'ORDER_CREATED',        -- For Saga recovery
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- ============================================================
-- =============== INVENTORY SERVICE TABLES ===================
-- ============================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    price DECIMAL(10, 2) NOT NULL,
    version INT NOT NULL DEFAULT 1   -- optimistic locking
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,      -- ensures idempotency
    product_id UUID NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',   -- ACTIVE, RELEASED, CONSUMED
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- =============== PAYMENT SERVICE TABLES ======================
-- ============================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,         -- ensures idempotency
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, SUCCESS, FAILED
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- =============== OPTIONAL: ORCHESTRATOR DB ==================
-- ============================================================

-- Tracks Saga progress across multiple services

CREATE TABLE saga_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_id UUID NOT NULL,
    step VARCHAR(100),
    status VARCHAR(20),       -- STARTED, COMPLETED, FAILED
    data JSONB,               -- request/response details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE saga_state (
    saga_id UUID PRIMARY KEY,
    order_id UUID,
    current_step VARCHAR(100),
    status VARCHAR(20),       -- RUNNING, DONE, COMPENSATED
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

