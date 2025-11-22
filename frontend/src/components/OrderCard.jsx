// src/components/OrderCard.jsx
function OrderCard({ order }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const isProcessing = ['pending', 'routing', 'building', 'submitted'].includes(order.status);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    routing: 'bg-blue-100 text-blue-800',
    building: 'bg-orange-100 text-orange-800',
    submitted: 'bg-gray-100 text-gray-800',
    confirmed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    connected: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className={`bg-white rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${isProcessing ? 'animate-pulse-slow' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-gray-100">
        <div className="font-mono text-xs text-gray-600 font-semibold">
          {order.orderId?.substring(0, 8)}...
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
          {order.status}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Type:</span>
          <span>{order.orderType}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Pair:</span>
          <span >{order.tokenIn} → {order.tokenOut}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Amount:</span>
          <span>{order.amountIn}</span>
        </div>
        
        {order.selectedDex && (
          <div className="flex justify-between text-sm">
            <span className="font-semibold">DEX:</span>
            <span>{order.selectedDex}</span>
          </div>
        )}
        
        {order.expectedOutput && (
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Expected:</span>
            <span>{order.expectedOutput}</span>
          </div>
        )}
        
        {order.executedPrice && (
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-gray-700">Price:</span>
            <span className="text-green-600">{order.executedPrice}</span>
          </div>
        )}
        
        {order.txHash && (
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-gray-700">TX:</span>
            <span className="font-mono text-xs text-gray-500">{order.txHash.substring(0, 20)}...</span>
          </div>
        )}
        
        {order.error && (
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-gray-700">Error:</span>
            <span className="text-red-600 text-xs">{order.error}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="mt-4 pt-4 border-t-2 border-gray-100">
          <div className="flex space-x-2 mt-3">
            {order.timeline.map((item, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2.5 flex-shrink-0"></div>
                <span className="text-gray-400 text-xs ml-auto">{formatTime(item.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderCard;
