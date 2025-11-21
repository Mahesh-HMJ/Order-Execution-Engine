// tests/websocket.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebSocketManager, wsManager } from '../src/services/websocket.service';
import { WebSocket } from 'ws';

describe('WebSocketManager', () => {
    let wsManager: WebSocketManager;
    let mockSocket: any;

    beforeEach(() => {
        wsManager = new WebSocketManager();

        // Create mock WebSocket
        mockSocket = {
            readyState: WebSocket.OPEN,
            send: vi.fn(),
            on: vi.fn(),
            close: vi.fn(),
        };
    });

    it('should add a connection', () => {
        wsManager.addConnection('order-123', { socket: mockSocket });

        // Broadcast to verify connection was added
        wsManager.broadcast('order-123', { status: 'test' });

        expect(mockSocket.send).toHaveBeenCalled();
    });

    it('should remove a connection', () => {
        const connection = { socket: mockSocket };
        wsManager.addConnection('order-123', connection);
        wsManager.removeConnection('order-123', connection);

        // Broadcast should not call send after removal
        mockSocket.send.mockClear();
        wsManager.broadcast('order-123', { status: 'test' });

        expect(mockSocket.send).not.toHaveBeenCalled();
    });

    it('should broadcast to multiple connections', () => {
        const mockSocket1 = { ...mockSocket, send: vi.fn(), readyState: WebSocket.OPEN };
        const mockSocket2 = { ...mockSocket, send: vi.fn(), readyState: WebSocket.OPEN };

        wsManager.addConnection('order-123', { socket: mockSocket1 });
        wsManager.addConnection('order-123', { socket: mockSocket2 });

        wsManager.broadcast('order-123', { status: 'routing' });

        expect(mockSocket1.send).toHaveBeenCalled();
        expect(mockSocket2.send).toHaveBeenCalled();
    });

    it('should not broadcast to closed connections', () => {
        const closedSocket = { ...mockSocket, readyState: WebSocket.CLOSED, send: vi.fn() };

        wsManager.addConnection('order-123', { socket: closedSocket });
        wsManager.broadcast('order-123', { status: 'test' });

        expect(closedSocket.send).not.toHaveBeenCalled();
    });

    it('should include timestamp in broadcast messages', () => {
        wsManager.addConnection('order-123', { socket: mockSocket });
        wsManager.broadcast('order-123', { status: 'pending' });

        const callArgs = mockSocket.send.mock.calls[0][0];
        const message = JSON.parse(callArgs);

        expect(message).toHaveProperty('timestamp');
        expect(message).toHaveProperty('orderId', 'order-123');
        expect(message).toHaveProperty('status', 'pending');
    });
});
it('should handle broadcasting to non-existent orderId gracefully', () => {
    const result = wsManager.broadcast('non-existent-order', { status: 'test' });
    expect(result).toBeUndefined();
});