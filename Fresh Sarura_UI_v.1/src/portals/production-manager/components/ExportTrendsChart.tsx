import { TrendingUp, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const ExportTrendsChart = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mock data for Intake vs Export Target
  const datasets = {
    '7days': {
      data: [
        { label: 'Mon', intake: 4.2, target: 4.5 },
        { label: 'Tue', intake: 3.8, target: 4.0 },
        { label: 'Wed', intake: 5.1, target: 5.0 },
        { label: 'Thu', intake: 4.8, target: 4.5 },
        { label: 'Fri', intake: 5.5, target: 5.2 },
        { label: 'Sat', intake: 6.2, target: 6.0 },
        { label: 'Sun', intake: 3.5, target: 4.0 },
      ],
      balance: '98%', // Overall balance
      status: 'On Track',
      positive: true,
    },
    '30days': {
      data: [
        { label: 'Week 1', intake: 28.5, target: 30.0 },
        { label: 'Week 2', intake: 32.0, target: 31.5 },
        { label: 'Week 3', intake: 29.8, target: 30.0 },
        { label: 'Week 4', intake: 34.5, target: 33.0 },
      ],
      balance: '101%',
      status: 'Surplus',
      positive: true,
    },
    '90days': {
      data: [
        { label: 'Month 1', intake: 124.0, target: 120.0 },
        { label: 'Month 2', intake: 138.5, target: 140.0 },
        { label: 'Month 3', intake: 152.0, target: 150.0 },
      ],
      balance: '99%',
      status: 'Balanced',
      positive: true,
    },
  };

  const currentData = datasets[timeRange as keyof typeof datasets];
  const maxValue = Math.max(...currentData.data.flatMap(d => [d.intake, d.target])) * 1.2;

  const timeRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-[0_2px_6px_rgba(0,0,0,0.06)] h-full transition-colors duration-300 border-theme">


      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#222222] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Intake vs. Export Target
          </h3>
          <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            Supply vs. Demand Balance (Tonnes)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentData.positive ? 'bg-green-50 text-[#2E7D32] dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
            <CheckCircle size={16} />
            <span className="text-sm font-semibold">Balance: {currentData.balance}</span>
          </div>

          {/* Time Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F3F6F0] dark:bg-gray-700 text-[#37474F] dark:text-gray-200 text-sm font-medium hover:bg-[#E0E0E0] dark:hover:bg-gray-600 transition-all"
            >
              {timeRangeOptions.find(opt => opt.value === timeRange)?.label}
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimeRange(option.value);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${timeRange === option.value
                      ? 'bg-[#E9F7EF] text-[#4CAF50] dark:bg-green-900/20 dark:text-green-400 font-medium'
                      : 'text-[#6B7280] dark:text-gray-400 hover:bg-[#F3F6F0] dark:hover:bg-gray-700'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between h-64 gap-4 px-2">
        {currentData.data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
            <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-32">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg text-center">
                  <p className="font-semibold mb-1 border-b border-gray-700 pb-1">{item.label}</p>
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Intake:</span>
                      <span className="font-mono">{item.intake}t</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Target:</span>
                      <span className="font-mono">{item.target}t</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intake Bar */}
              <div
                className="w-1/2 max-w-[24px] bg-gradient-to-t from-[#2E7D32] to-[#66BB6A] rounded-t sm:rounded-t-md transition-all duration-500 group-hover:opacity-90 relative"
                style={{ height: `${(item.intake / maxValue) * 100}%` }}
              >
              </div>

              {/* Target Bar */}
              <div
                className="w-1/2 max-w-[24px] bg-gradient-to-t from-[#1565C0] to-[#42A5F5] rounded-t sm:rounded-t-md transition-all duration-500 group-hover:opacity-90 relative"
                style={{ height: `${(item.target / maxValue) * 100}%` }}
              >
              </div>
            </div>

            <span className="text-xs text-[#6B7280] dark:text-gray-400 font-medium">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2E7D32]"></div>
          <span className="text-sm font-medium text-[#37474F] dark:text-gray-300">Intake (Field)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#1565C0]"></div>
          <span className="text-sm font-medium text-[#37474F] dark:text-gray-300">Export Target (Orders)</span>
        </div>
      </div>
    </div>
  );
};

export default ExportTrendsChart;
