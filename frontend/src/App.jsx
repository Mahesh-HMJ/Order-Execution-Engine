// src/App.jsx
import { useState, useEffect } from 'react';
import OrderForm from './components/OrderForm';
import OrderCard from './components/OrderCard';
import Stats from './components/Stats';
import { submitOrder, connectWebSocket } from './services/api';

function App() {
  const [orders, setOrders] = useState(new Map());
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    failed: 0,
    processing: 0
  });

  useEffect(() => {
    const newStats = {
      total: orders.size,
      confirmed: 0,
      failed: 0,
      processing: 0
    };

    orders.forEach(order => {
      if (order.status === 'confirmed') newStats.confirmed++;
      else if (order.status === 'failed') newStats.failed++;
      else if (['pending', 'routing', 'building', 'submitted'].includes(order.status)) {
        newStats.processing++;
      }
    });

    setStats(newStats);
  }, [orders]);

  const handleSubmitOrder = async (orderData) => {
    try {
      const response = await submitOrder(orderData);

      setOrders(prev => {
        const newOrders = new Map(prev);
        newOrders.set(response.orderId, {
          orderId: response.orderId,
          ...orderData,
          status: response.status,
          timeline: [{ status: response.status, timestamp: new Date().toISOString() }]
        });
        return newOrders;
      });

      connectWebSocket(response.orderId, (update) => {
        setOrders(prev => {
          const newOrders = new Map(prev);
          const order = newOrders.get(response.orderId) || { orderId: response.orderId, timeline: [] };

          Object.assign(order, update);

          if (update.status && !order.timeline.some(t => t.status === update.status)) {
            order.timeline.push({
              status: update.status,
              timestamp: update.timestamp || new Date().toISOString()
            });
          }

          newOrders.set(response.orderId, order);
          return newOrders;
        });
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const ordersArray = Array.from(orders.values()).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-8 mb-8 shadow-lg rounded-b-2xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
            <span>🚀</span> Order Execution Engine
          </h1>
          <p className="text-lg text-white/90 font-medium">Real-time DEX routing with WebSocket updates</p>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-5 pb-10">
        <Stats stats={stats} />
        <OrderForm onSubmit={handleSubmitOrder} />

        {/* Orders Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">Active Orders</h2>
          {ordersArray.length === 0 ? (
            <div className="bg-gray-100 text-gray-400 text-center py-14 mb-4 rounded-xl">
              <span className="text-6xl block mb-3">📦</span>
              No orders yet. Submit an order to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ordersArray.map(order => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;