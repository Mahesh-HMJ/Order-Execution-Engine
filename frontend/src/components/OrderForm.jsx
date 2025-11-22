// src/components/OrderForm.jsx
import { useState } from 'react';

function OrderForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    orderType: 'market',
    tokenIn: 'SOL',
    tokenOut: 'USDC',
    amountIn: 1000
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amountIn' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await onSubmit(formData);

    if (result.success) {
      setTimeout(() => setIsSubmitting(false), 1000);
    } else {
      alert(`Error: ${result.error}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 mb-8 mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold text-indigo-600 mb-6">Submit New Order</h2>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          {/* Order Type */}
          <div>
            <label htmlFor="orderType" className="font-semibold text-gray-600 mb-2 block">
              Order Type
            </label>
            <select
              id="orderType"
              name="orderType"
              value={formData.orderType}
              onChange={handleChange}
              required
              className="w-full p-3 rounded border-2 border-gray-300 focus:border-indigo-500"
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
              <option value="sniper">Sniper</option>
            </select>
          </div>

          {/* Token In */}
          <div>
            <label htmlFor="tokenIn" className="font-semibold text-gray-600 mb-2 block">
              Token In
            </label>
            <input
              type="text"
              id="tokenIn"
              name="tokenIn"
              value={formData.tokenIn}
              onChange={handleChange}
              required
              className="w-full p-3 rounded border-2 border-gray-300 focus:border-indigo-500" 
            />
          </div>

          {/* Token Out */}
          <div>
            <label htmlFor="tokenOut" className="font-semibold text-gray-600 mb-2 block">
              Token Out
            </label>
            <input
              type="text"
              id="tokenOut"
              name="tokenOut"
              value={formData.tokenOut}
              onChange={handleChange}
              required
              className="w-full p-3 rounded border-2 border-gray-300 focus:border-indigo-500"
            />
          </div>

          {/* Amount In */}
          <div>
            <label htmlFor="amountIn" className="font-semibold text-gray-600 mb-2 block">
              Amount In
            </label>
            <input
              type="number"
              id="amountIn"
              name="amountIn"
              value={formData.amountIn}
              onChange={handleChange}
              min="1"
              required
              className="w-full p-3 rounded border-2 border-gray-300 focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded shadow hover:from-indigo-600 hover:to-purple-700 transition">
            Submit Order
        </button>
      </form>
    </div>
  );
}

export default OrderForm;