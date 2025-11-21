// src/services/order.service.ts
import { orderModel } from '../models/order.model';
import { CreateOrderInput, OrderRecord, OrderStatus } from '../types/order.types';

export class OrderService {
  async createOrder(input: CreateOrderInput): Promise<OrderRecord> {
    // Basic validation can live here or in route layer
    if (!input.tokenIn || !input.tokenOut || input.amountIn <= 0) {
      throw new Error('Invalid order input');
    }
    return orderModel.create(input);
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    extra?: Parameters<typeof orderModel.updateStatus>[2],
  ): Promise<OrderRecord> {
    return orderModel.updateStatus(id, status, extra);
  }

  async getOrderById(id: string): Promise<OrderRecord | null> {
    return orderModel.findById(id);
  }
}

export const orderService = new OrderService();
