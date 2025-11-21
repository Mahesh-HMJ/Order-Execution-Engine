// src/services/queue.service.ts
import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { dexRouter } from './dex-router.service';
import { orderService } from './order.service';
import { OrderRecord } from '../types/order.types';
import { wsManager } from './websocket.service'; // we'll stub this for now

export class OrderQueue {
  queue: Queue;

  constructor() {
    this.queue = new Queue('orders', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.createWorker();
  }

  private createWorker() {
    const worker = new Worker(
      'orders',
      async (job: Job<OrderRecord>) => {
        return this.processOrder(job.data);
      },
      {
        connection: redis,
        concurrency: 10,
        limiter: {
          max: 100,
          duration: 60_000,
        },
      },
    );

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err.message);
    });
  }

  async enqueue(order: OrderRecord) {
    await this.queue.add('execute', order, { jobId: order.id });
  }

  private async processOrder(order: OrderRecord) {
    const orderId = order.id;

    // routing
    await orderService.updateOrderStatus(orderId, 'routing');
    wsManager.broadcast(orderId, { status: 'routing' });

    const amount = Number(order.amountIn);
    const route = await dexRouter.getBestRoute(order.tokenIn, order.tokenOut, amount);

    await orderService.updateOrderStatus(orderId, 'building', {
      selectedDex: route.dex,
      expectedOutput: String(route.estimatedOutput),
    });
    wsManager.broadcast(orderId, {
      status: 'building',
      selectedDex: route.dex,
      expectedOutput: route.estimatedOutput,
    });

    await orderService.updateOrderStatus(orderId, 'submitted');
    wsManager.broadcast(orderId, { status: 'submitted' });

    try {
      const result = await dexRouter.executeSwap(route.dex, route.price);

      await orderService.updateOrderStatus(orderId, 'confirmed', {
        executedPrice: String(result.executedPrice),
        txHash: result.txHash,
      });
      wsManager.broadcast(orderId, {
        status: 'confirmed',
        txHash: result.txHash,
        executedPrice: result.executedPrice,
      });
    } catch (err: any) {
      await orderService.updateOrderStatus(orderId, 'failed', {
        errorMessage: err.message,
      });
      wsManager.broadcast(orderId, { status: 'failed', error: err.message });
      throw err;
    }
  }
}

export const orderQueue = new OrderQueue();
