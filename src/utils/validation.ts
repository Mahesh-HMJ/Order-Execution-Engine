// src/utils/validation.ts
import { OrderType } from '../types/order.types';

export class Validator {
    isValidOrderType(type: string): type is OrderType {
        return ['market', 'limit', 'sniper'].includes(type);
    }

    isValidTokenPair(tokenIn: string, tokenOut: string): boolean {
        return (
            !!tokenIn &&
            !!tokenOut &&
            tokenIn.length > 0 &&
            tokenOut.length > 0 &&
            tokenIn !== tokenOut
        );
    }


    isValidAmount(amount: number): boolean {
        return amount > 0 && Number.isFinite(amount);
    }
}

export const validator = new Validator();
