// src/server.ts
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { orderRoutes } from './routes/order.routes';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({ 
  logger: true,
  requestTimeout: 30000,
});

// Register WebSocket plugin
fastify.register(websocket);

// Register API routes
fastify.register(orderRoutes, { prefix: '/api/orders' });

// Health check endpoint
fastify.get('/health', async () => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
