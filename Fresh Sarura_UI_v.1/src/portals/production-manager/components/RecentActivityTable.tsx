const RecentActivityTable = () => {
  const activities = [
    {
      batchId: 'BTH-2024-0847',
      product: 'French Beans',
      status: 'In Transit',
      destination: 'Netherlands',
      date: 'Oct 28',
      time: '14:30',
      statusColor: 'bg-blue-100 text-blue-700',
    },
    {
      batchId: 'BTH-2024-0846',
      product: 'Passion Fruit',
      status: 'Quality Check',
      destination: 'Germany',
      date: 'Oct 28',
      time: '11:05',
      statusColor: 'bg-yellow-100 text-yellow-700',
    },
    {
      batchId: 'BTH-2024-0845',
      product: 'Avocados',
      status: 'Delivered',
      destination: 'Dubai',
      date: 'Oct 27',
      time: '20:15',
      statusColor: 'bg-green-100 text-green-700',
    },
    {
      batchId: 'BTH-2024-0844',
      product: 'Chili Peppers',
      status: 'Pending Export',
      destination: 'Belgium',
      date: 'Oct 27',
      time: '09:45',
      statusColor: 'bg-gray-100 text-gray-700',
    },
    {
      batchId: 'BTH-2024-0843',
      product: 'French Beans',
      status: 'In Transit',
      destination: 'UK',
      date: 'Oct 26',
      time: '16:00',
      statusColor: 'bg-blue-100 text-blue-700',
    },
    {
      batchId: 'BTH-2024-0842',
      product: 'Mangoes',
      status: 'Delivered',
      destination: 'France',
      date: 'Oct 26',
      time: '08:20',
      statusColor: 'bg-green-100 text-green-700',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-[0_2px_6px_rgba(0,0,0,0.06)] transition-colors border-theme">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-[#222222] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Recent Activity</h3>
          <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Latest batch movements and updates</p>
        </div>
        <button className="text-sm text-[#4CAF50] font-semibold hover:text-[#66BB6A] transition-colors">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                Batch ID
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                Destination
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider">
                Date &amp; Time
              </th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr
                key={index}
                className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-[#F3F6F0] dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="text-sm font-semibold text-[#222222] dark:text-gray-200">{activity.batchId}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-[#222222] dark:text-gray-300">{activity.product}</span>
                </td>
                <td className="py-4 px-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${activity.statusColor} dark:text-opacity-80`}>
                    {activity.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-[#222222] dark:text-gray-300">{activity.destination}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-[#6B7280] dark:text-gray-400 whitespace-nowrap">
                    {activity.date}
                    <span className="mx-1 text-gray-300 dark:text-gray-600">•</span>
                    {activity.time}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivityTable;
