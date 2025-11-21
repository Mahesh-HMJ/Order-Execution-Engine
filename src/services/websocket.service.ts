// src/services/websocket.service.ts

import { WebSocket } from 'ws';  // ws is a common WebSocket library for Node.js

// Each connection wraps WebSocket instance 
interface Connection {
  socket: WebSocket;
}

export class WebSocketManager {
  // Map order ID to a Set of WebSocket connections
  private connectionsByOrderId: Map<string, Set<Connection>> = new Map();

  // Add new client connection for an order
  addConnection(orderId: string, connection: Connection): void {
    if (!this.connectionsByOrderId.has(orderId)) {
      this.connectionsByOrderId.set(orderId, new Set());
    }
    this.connectionsByOrderId.get(orderId)!.add(connection);
  }

  // Remove client connection—for example, when socket closes
  removeConnection(orderId: string, connection: Connection): void {
    const connections = this.connectionsByOrderId.get(orderId);
    if (!connections) return;
    
    connections.delete(connection);

    if (connections.size === 0) {
      this.connectionsByOrderId.delete(orderId);
    }
  }

  // Broadcast a message (order status update) to all clients connected to the order
  broadcast(orderId: string, message: any): void {
    const connections = this.connectionsByOrderId.get(orderId);
    if (!connections) return;

    const payload = JSON.stringify({
      orderId,
      ...message,
      timestamp: new Date().toISOString(),
    });

    connections.forEach((connection) => {
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.send(payload);
      }
    });
  }
}

// Export a singleton instance for app to use
export const wsManager = new WebSocketManager();
