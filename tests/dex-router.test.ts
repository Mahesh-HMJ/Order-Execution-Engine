// tests/dex-router.test.ts
import { describe, it, expect } from 'vitest';
import { dexRouter } from '../src/services/dex-router.service';

describe('DexRouter', () => {
  it('should return a valid Raydium quote', async () => {
    const quote = await dexRouter.getRaydiumQuote('SOL', 'USDC', 1000);
    
    expect(quote).toBeDefined();
    expect(quote.dex).toBe('raydium');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.fee).toBe(0.003);
    expect(quote.estimatedOutput).toBeGreaterThan(0);
    expect(quote.liquidity).toBeGreaterThan(0);
  });

  it('should return a valid Meteora quote', async () => {
    const quote = await dexRouter.getMeteoraQuote('SOL', 'USDC', 1000);
    
    expect(quote).toBeDefined();
    expect(quote.dex).toBe('meteora');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.fee).toBe(0.002);
    expect(quote.estimatedOutput).toBeGreaterThan(0);
    expect(quote.liquidity).toBeGreaterThan(0);
  });

  it('should select the best route between DEXes', async () => {
    const route = await dexRouter.getBestRoute('SOL', 'USDC', 1000);
    
    expect(route).toBeDefined();
    expect(['raydium', 'meteora']).toContain(route.dex);
    expect(route.estimatedOutput).toBeGreaterThan(0);
  });

  it('should execute swap successfully', async () => {
    const result = await dexRouter.executeSwap('raydium', 100);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.txHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.executedPrice).toBeGreaterThan(0);
  });

  it('should handle swap execution with realistic delay', async () => {
    const startTime = Date.now();
    await dexRouter.executeSwap('meteora', 100);
    const duration = Date.now() - startTime;
    
    // Should take at least 2 seconds (mock delay)
    expect(duration).toBeGreaterThanOrEqual(2000);
  });
});
