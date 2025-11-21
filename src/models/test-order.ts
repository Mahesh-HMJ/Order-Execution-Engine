// src/models/test-order.ts
import { orderModel } from './order.model';

async function main() {
  const order = await orderModel.create({
    orderType: 'market',
    tokenIn: 'SOL',
    tokenOut: 'USDC',
    amountIn: 100,
  });

  console.log('Created order:', order);

  const updated = await orderModel.updateStatus(order.id, 'routing', {
    selectedDex: 'raydium',
  });

  console.log('Updated order:', updated);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
