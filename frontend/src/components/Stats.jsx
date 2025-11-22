// src/components/Stats.jsx
function Stats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow flex flex-col items-center py-6">
        <span className="text-3xl font-bold text-indigo-600">{stats.total}</span>
        <span className="mt-2 text-sm text-gray-500 font-semibold">Total Orders</span>
      </div>
      <div className="bg-white rounded-xl shadow flex flex-col items-center py-6">
        <span className="text-3xl font-bold text-green-600">{stats.confirmed}</span>
        <span className="mt-2 text-sm text-gray-500 font-semibold">Confirmed</span>
      </div>
      <div className="bg-white rounded-xl shadow flex flex-col items-center py-6">
        <span className="text-3xl font-bold text-red-500">{stats.failed}</span>
        <span className="mt-2 text-sm text-gray-500 font-semibold">Failed</span>
      </div>
      <div className="bg-white rounded-xl shadow flex flex-col items-center py-6">
        <span className="text-3xl font-bold text-yellow-500">{stats.processing}</span>
        <span className="mt-2 text-sm text-gray-500 font-semibold">Processing</span>
      </div>
    </div>

  );
}

export default Stats;
