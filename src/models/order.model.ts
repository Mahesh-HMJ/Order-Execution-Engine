// src/models/order.model.ts
import { db } from '../config/database';
import { CreateOrderInput, OrderRecord, OrderStatus } from '../types/order.types';

export class OrderModel {
  async create(input: CreateOrderInput): Promise<OrderRecord> {
    const query = `
      INSERT INTO orders (
        order_type, token_in, token_out, amount_in, target_price
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        order_type as "orderType",
        token_in as "tokenIn",
        token_out as "tokenOut",
        amount_in as "amountIn",
        target_price as "targetPrice",
        status,
        selected_dex as "selectedDex",
        expected_output as "expectedOutput",
        executed_price as "executedPrice",
        tx_hash as "txHash",
        error_message as "errorMessage",
        retry_count as "retryCount",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      input.orderType,
      input.tokenIn,
      input.tokenOut,
      input.amountIn,
      input.targetPrice ?? null,
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    extra?: Partial<{
      selectedDex: string;
      expectedOutput: string;
      executedPrice: string;
      txHash: string;
      errorMessage: string;
      retryCount: number;
    }>,
  ): Promise<OrderRecord> {
    const fields: string[] = ['status'];
    const values: any[] = [status];
    let idx = 2;

    if (extra?.selectedDex !== undefined) {
      fields.push(`selected_dex = $${idx++}`);
      values.push(extra.selectedDex);
    }
    if (extra?.expectedOutput !== undefined) {
      fields.push(`expected_output = $${idx++}`);
      values.push(extra.expectedOutput);
    }
    if (extra?.executedPrice !== undefined) {
      fields.push(`executed_price = $${idx++}`);
      values.push(extra.executedPrice);
    }
    if (extra?.txHash !== undefined) {
      fields.push(`tx_hash = $${idx++}`);
      values.push(extra.txHash);
    }
    if (extra?.errorMessage !== undefined) {
      fields.push(`error_message = $${idx++}`);
      values.push(extra.errorMessage);
    }
    if (extra?.retryCount !== undefined) {
      fields.push(`retry_count = $${idx++}`);
      values.push(extra.retryCount);
    }

    const setClause = fields.map((f, i) => (i === 0 ? `${f} = $1` : f)).join(', ');

    const query = `
      UPDATE orders
      SET ${setClause}
      WHERE id = $${idx}
      RETURNING
        id,
        order_type as "orderType",
        token_in as "tokenIn",
        token_out as "tokenOut",
        amount_in as "amountIn",
        target_price as "targetPrice",
        status,
        selected_dex as "selectedDex",
        expected_output as "expectedOutput",
        executed_price as "executedPrice",
        tx_hash as "txHash",
        error_message as "errorMessage",
        retry_count as "retryCount",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    values.push(id);

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async findById(id: string): Promise<OrderRecord | null> {
    const query = `
      SELECT
        id,
        order_type as "orderType",
        token_in as "tokenIn",
        token_out as "tokenOut",
        amount_in as "amountIn",
        target_price as "targetPrice",
        status,
        selected_dex as "selectedDex",
        expected_output as "expectedOutput",
        executed_price as "executedPrice",
        tx_hash as "txHash",
        error_message as "errorMessage",
        retry_count as "retryCount",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM orders
      WHERE id = $1
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] ?? null;
  }
}

export const orderModel = new OrderModel();
