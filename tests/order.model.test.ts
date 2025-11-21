// tests/order.model.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { orderModel } from '../src/models/order.model';
import { db } from '../src/config/database';

describe('OrderModel', () => {
  beforeEach(async () => {
    // Clean up any previous test orders
    await db.query('DELETE FROM orders WHERE token_in = $1', ['TEST_TOKEN']);
  });

  it('should create a new order', async () => {
    const order = await orderModel.create({
      orderType: 'market',
      tokenIn: 'TEST_TOKEN',
      tokenOut: 'USDC',
      amountIn: 1000,
    });

    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.orderType).toBe('market');
    expect(order.tokenIn).toBe('TEST_TOKEN');
    expect(order.status).toBe('pending');
  });

  it('should update order status', async () => {
    // Create order first
    const order = await orderModel.create({
      orderType: 'market',
      tokenIn: 'TEST_TOKEN',
      tokenOut: 'USDC',
      amountIn: 500,
    });

    // Update status
    const updated = await orderModel.updateStatus(order.id, 'routing', {
      selectedDex: 'raydium',
    });

    expect(updated.status).toBe('routing');
    expect(updated.selectedDex).toBe('raydium');
  });

  it('should find order by ID', async () => {
    // Create order
    const created = await orderModel.create({
      orderType: 'market',
      tokenIn: 'TEST_TOKEN',
      tokenOut: 'USDC',
      amountIn: 750,
    });

    // Find it
    const found = await orderModel.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.amountIn).toBe(created.amountIn);
  });

  it('should return null for non-existent order', async () => {
    const found = await orderModel.findById('00000000-0000-0000-0000-000000000000');
    expect(found).toBeNull();
  });
});
