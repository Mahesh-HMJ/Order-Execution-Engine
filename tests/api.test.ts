// tests/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { orderRoutes } from '../src/routes/order.routes';

describe('API Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = Fastify();
    app.register(websocket);
    app.register(orderRoutes, { prefix: '/api/orders' });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create an order via POST /api/orders/execute', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/execute',
      payload: {
        orderType: 'market',
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amountIn: 1000,
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('orderId');
    expect(body).toHaveProperty('status', 'pending');
    expect(body).toHaveProperty('wsUrl');
  });

  it('should reject invalid order type', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/execute',
      payload: {
        orderType: 'invalid',
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amountIn: 1000,
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('error');
  });

  it('should reject invalid amount', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/orders/execute',
      payload: {
        orderType: 'market',
        tokenIn: 'SOL',
        tokenOut: 'USDC',
        amountIn: -100,
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
