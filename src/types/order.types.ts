// src/types/order.types.ts

export type OrderType = 'market' | 'limit' | 'sniper';

export type OrderStatus =
  | 'pending'
  | 'routing'
  | 'building'
  | 'submitted'
  | 'confirmed'
  | 'failed';

export interface CreateOrderInput {
  orderType: OrderType;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  targetPrice?: number | null;
}

export interface OrderRecord {
  id: string;
  orderType: OrderType;
  tokenIn: string;
  tokenOut: string;
  amountIn: string; // from DB as text/decimal
  targetPrice: string | null;
  status: OrderStatus;
  selectedDex: string | null;
  expectedOutput: string | null;
  executedPrice: string | null;
  txHash: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
