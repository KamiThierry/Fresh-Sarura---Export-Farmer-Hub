import { TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { usePMContext } from '@/context/PMContext';

const LossAnalyticsChart = () => {
  const { stock } = usePMContext();

  const data = useMemo(() => {
    const now = new Date();
    const months = [];

    for (let m = 5; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const monthBatches = stock.filter(b => b.updatedAt?.startsWith(monthStr));
      const totalReceived = monthBatches.reduce((s: number, b: any) => s + (b.receivedWeightKg || 0), 0);
      const totalRejected = monthBatches.reduce((s: number, b: any) => s + (b.rejectedWeightKg || 0), 0);
      const lossRate = totalReceived > 0
        ? parseFloat(((totalRejected / totalReceived) * 100).toFixed(1))
        : null;

      months.push({ month: label, loss: lossRate });
    }
    return months;
  }, [stock]);

  const validData = data.filter(d => d.loss !== null) as { month: string; loss: number }[];
  const maxValue = validData.length > 0 ? Math.max(...validData.map(d => d.loss), 1) : 10;

  const points = validData.map((item, index) => {
    const x = validData.length > 1 ? (index / (validData.length - 1)) * 100 : 50;
    const y = 100 - (item.loss / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  const firstLoss = validData[0]?.loss ?? 0;
  const lastLoss = validData[validData.length - 1]?.loss ?? 0;
  const trend = validData.length >= 2 ? ((lastLoss - firstLoss) / (firstLoss || 1)) * 100 : 0;
  const improving = trend <= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-[0_2px_6px_rgba(0,0,0,0.06)] h-full flex flex-col transition-colors border-theme">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#222222] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Loss Analytics
        </h3>
        <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          Post-harvest loss trends
        </p>
      </div>

      {validData.length >= 2 ? (
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex items-center gap-1 ${improving ? 'text-[#4CAF50]' : 'text-red-500'}`}>
            {improving ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
            <span className="text-xs font-semibold">{improving ? '' : '+'}{trend.toFixed(1)}%</span>
          </div>
          <span className="text-xs text-[#6B7280] dark:text-gray-400">vs first recorded period</span>
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-4">Not enough data to show trend yet.</p>
      )}

      <div className="flex-1 relative min-h-[80px]">
        {validData.length > 0 ? (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E7D32" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2E7D32" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <polyline points={points} fill="none" stroke="#2E7D32" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <polyline points={`0,100 ${points} 100,100`} fill="url(#lossGradient)" />
            {validData.map((item, index) => {
              const x = validData.length > 1 ? (index / (validData.length - 1)) * 100 : 50;
              const y = 100 - (item.loss / maxValue) * 100;
              return <circle key={index} cx={x} cy={y} r="2" fill="#2E7D32" vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">No loss data yet.</div>
        )}
      </div>

      <div className="flex justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        {data.map((item, index) => (
          <div key={index} className="text-center">
            <p className="text-xs text-[#6B7280] dark:text-gray-400">{item.month}</p>
            <p className="text-sm font-bold text-[#222222] dark:text-white mt-1">
              {item.loss !== null ? `${item.loss}%` : '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LossAnalyticsChart;
