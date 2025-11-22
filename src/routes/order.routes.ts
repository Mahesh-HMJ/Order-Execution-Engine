// src/routes/order.routes.ts
import { FastifyBaseLogger, FastifyInstance, FastifyReply, FastifyRequest, FastifyTypeProvider, RawServerDefault } from 'fastify';
import { wsManager } from '../services/websocket.service';
import { orderService } from '../services/order.service';
import { orderQueue } from '../services/queue.service';
import { IncomingMessage, ServerResponse } from 'http';


export async function orderRoutes(fastify: FastifyInstance) {
  // POST /api/orders/execute - create and enqueue order
  fastify.post('/execute', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const {
        orderType,
        tokenIn,
        tokenOut,
        amountIn,
        targetPrice,
      } = request.body as {
        orderType: string;
        tokenIn: string;
        tokenOut: string;
        amountIn: number;
        targetPrice?: number | null;
      };

      // Validation
      if (!['market', 'limit', 'sniper'].includes(orderType)) {
        return reply.status(400).send({ error: 'Invalid order type' });
      }
      if (!tokenIn || !tokenOut || amountIn <= 0) {
        return reply.status(400).send({ error: 'Invalid input fields' });
      }

      // Create order in DB
      const order = await orderService.createOrder({
        orderType: orderType as any,
        tokenIn,
        tokenOut,
        amountIn,
        targetPrice: targetPrice ?? null,
      });

      // Add order to processing queue
      await orderQueue.enqueue(order);

      // Return orderId and WebSocket endpoint URL
      return reply.status(201).send({
        orderId: order.id,
        status: order.status,
        wsUrl: `/api/orders/ws/${order.id}`,
      });
    } catch (err: any) {
      fastify.log.error('Order creation error:', err);
      return reply.status(500).send({ error: 'Failed to create order' });
    }
  });

  // GET /api/orders/:orderId - get order details
  fastify.get('/:orderId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { orderId } = request.params as { orderId: string };
      const order = await orderService.getOrderById(orderId);

      if (!order) {
        return reply.status(404).send({ error: 'Order not found' });
      }

      return reply.send(order);
    } catch (err: any) {
      fastify.log.error('Order fetch error:', err);
      return reply.status(500).send({ error: 'Failed to fetch order' });
    }
  });

  // WebSocket route for live updates
  fastify.get('/ws/:orderId', { websocket: true }, (ws, request) => {
    const { orderId } = request.params as { orderId: string };

    // Wrap raw ws in Connection interface
    wsManager.addConnection(orderId, { socket: ws });

    ws.on('close', () => {
      wsManager.removeConnection(orderId, { socket: ws });
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for order ${orderId}:`, err);
    });

    // Send initial connection message
    ws.send(
      JSON.stringify({
        orderId,
        status: 'connected',
        timestamp: new Date().toISOString(),
      }),
    );
  });
}


