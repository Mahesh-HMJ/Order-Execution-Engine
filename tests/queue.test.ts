// tests/queue.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { orderQueue } from '../src/services/queue.service';
import { orderModel } from '../src/models/order.model';

describe('OrderQueue', () => {
  beforeAll(async () => {
    // Ensure queue is initialized
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await orderQueue.queue.close();
  });

  it('should enqueue an order', async () => {
    const order = await orderModel.create({
      orderType: 'market',
      tokenIn: 'TEST_QUEUE',
      tokenOut: 'USDC',
      amountIn: 100,
    });

    await orderQueue.enqueue(order);

    const job = await orderQueue.queue.getJob(order.id);
    expect(job).toBeDefined();
    expect(job?.data.id).toBe(order.id);
  });

  it('should process order through all statuses', async () => {
    const order = await orderModel.create({
      orderType: 'market',
      tokenIn: 'TEST_LIFECYCLE',
      tokenOut: 'USDC',
      amountIn: 500,
    });

    await orderQueue.enqueue(order);

    // Wait for processing (adjust timeout as needed)
    await new Promise(resolve => setTimeout(resolve, 6000));

    const processed = await orderModel.findById(order.id);
    
    expect(processed).toBeDefined();
    expect(['confirmed', 'failed']).toContain(processed!.status);
  },10000);
});