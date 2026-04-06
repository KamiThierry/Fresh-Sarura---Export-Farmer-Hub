import { TrendingDown } from 'lucide-react';

const LossAnalyticsChart = () => {
  const data = [
    { month: 'Jan', loss: 8.5 },
    { month: 'Feb', loss: 7.2 },
    { month: 'Mar', loss: 6.8 },
    { month: 'Apr', loss: 5.9 },
    { month: 'May', loss: 5.2 },
    { month: 'Jun', loss: 4.8 },
  ];

  const maxValue = Math.max(...data.map(d => d.loss));
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.loss / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-[0_2px_6px_rgba(0,0,0,0.06)] h-full flex flex-col transition-colors border-theme">


      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#222222] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Loss Analytics</h3>
        <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Post-harvest loss trends</p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 text-[#4CAF50]">
          <TrendingDown size={18} />
          <span className="text-xs font-semibold">-43.5%</span>
        </div>
        <span className="text-xs text-[#6B7280] dark:text-gray-400">vs last period</span>
      </div>

      <div className="flex-1 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <polyline
            points={points}
            fill="none"
            stroke="#2E7D32"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={`0,100 ${points} 100,100`}
            fill="url(#lossGradient)"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.loss / maxValue) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="#2E7D32"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <p className="text-xs text-[#6B7280] dark:text-gray-400">{item.month}</p>
            <p className="text-sm font-bold text-[#222222] dark:text-white mt-1">{item.loss}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LossAnalyticsChart;
