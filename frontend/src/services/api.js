// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';
const WS_BASE_URL = 'ws://localhost:3000';

export const submitOrder = async (orderData) => {
  const response = await axios.post(`${API_BASE_URL}/api/orders/execute`, orderData);
  return response.data;
};

export const getOrder = async (orderId) => {
  const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`);
  return response.data;
};

export const connectWebSocket = (orderId, onMessage) => {
  const ws = new WebSocket(`${WS_BASE_URL}/api/orders/ws/${orderId}`);

  ws.onopen = () => {
    // Connected!
  };

  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    onMessage(update);
  };

  ws.onerror = (error) => {
    // Handle error
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    // Closed!
  };

  return ws;
};
export const disconnectWebSocket = (ws) => {
  if (ws) {
    ws.close();
  }
};
