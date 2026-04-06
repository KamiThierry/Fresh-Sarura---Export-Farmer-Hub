
import { Scale, Thermometer, ShieldCheck, Plane, Sprout } from 'lucide-react';

interface DashboardStatsProps {
  todaysIntake?: string;
  qualityGrade?: string;
  scheduledExports?: string;
}

const DashboardStats = ({
  todaysIntake = "2,450 kg",
  qualityGrade = "96% Class A",
  scheduledExports = "8 Tons"
}: DashboardStatsProps) => {
  const stats = [
    {
      icon: Scale,
      label: "Today's Intake",
      value: todaysIntake,
      sub: '+15% vs Avg',
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Thermometer,
      label: 'Cold Room Stock',
      value: '12.5 Tons',
      sub: '4 Tons expiring soon',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: ShieldCheck,
      label: 'Quality Grade',
      value: qualityGrade,
      sub: 'Top defect: Bruising',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Plane,
      label: 'Scheduled to Fly',
      value: scheduledExports,
      sub: 'Flight EK123 @ 10 PM',
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sprout className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Welcome back, Admin</h1>
          </div>
          <p className="text-green-100 text-lg opacity-90">
            Monitor your horticulture export operations and farmer network in real-time
          </p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 -mb-10 h-40 w-40 rounded-full bg-green-400 opacity-20 blur-2xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between border-theme"


          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 line-clamp-2 min-h-[1.5em]">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`${stat.color} dark:text-gray-100`} size={24} />
              </div>
            </div>

            <p className={`text-sm font-medium ${stat.color} dark:text-gray-300`}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
