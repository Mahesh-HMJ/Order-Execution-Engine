-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for type safety
CREATE TYPE order_type AS ENUM ('market', 'limit', 'sniper');
CREATE TYPE order_status AS ENUM (
    'pending',
    'routing',
    'building',
    'submitted',
    'confirmed',
    'failed'
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_type order_type NOT NULL,
    token_in VARCHAR(255) NOT NULL,
    token_out VARCHAR(255) NOT NULL,
    amount_in DECIMAL(20, 8) NOT NULL,
    target_price DECIMAL(20, 8),
    status order_status DEFAULT 'pending',
    selected_dex VARCHAR(50),
    expected_output DECIMAL(20, 8),
    executed_price DECIMAL(20, 8),
    tx_hash VARCHAR(255),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_tx_hash ON orders(tx_hash) WHERE tx_hash IS NOT NULL;

-- Order status history (optional but professional)
CREATE TABLE IF NOT EXISTS order_status_history (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
