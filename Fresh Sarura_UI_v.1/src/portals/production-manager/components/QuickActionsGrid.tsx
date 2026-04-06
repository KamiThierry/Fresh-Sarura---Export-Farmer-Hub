
import { PlusCircle, Microscope, Search } from 'lucide-react';

interface QuickActionsGridProps {
  onLogIntake?: () => void;
  onQCInspection?: () => void;
  onFindBatch?: () => void;
}

const QuickActionsGrid = ({ onLogIntake, onQCInspection, onFindBatch }: QuickActionsGridProps) => {
  const actions = [
    {
      icon: PlusCircle,
      title: 'Log Intake',
      sub: 'From Field/Truck',
      color: 'text-[#2E7D32]',
      bgColor: 'bg-[#E8F5E9]',
      borderColor: 'border-[#2E7D32]/20',
      hoverColor: 'hover:border-[#2E7D32]',
      action: onLogIntake,
    },
    {
      icon: Microscope,
      title: 'QC Inspection',
      sub: 'Grade & Sort',
      color: 'text-[#1565C0]',
      bgColor: 'bg-[#E3F2FD]',
      borderColor: 'border-[#1565C0]/20',
      hoverColor: 'hover:border-[#1565C0]',
      action: onQCInspection,
    },
    {
      icon: Search,
      title: 'Find Batch',
      sub: 'Traceability Lookup',
      color: 'text-[#E65100]',
      bgColor: 'bg-[#FFF3E0]',
      borderColor: 'border-[#E65100]/20',
      hoverColor: 'hover:border-[#E65100]',
      action: onFindBatch,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-5 mb-6">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.action}
          className={`flex items-center gap-4 p-4 rounded-xl border ${action.borderColor} bg-white dark:bg-gray-800 dark:border-white/10 border-theme shadow-sm transition-all duration-200 ${action.hoverColor} hover:shadow-md text-left group`}

        >
          <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
            <action.icon className={`${action.color}`} size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#222222] dark:text-white">{action.title}</h3>
            <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">{action.sub}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActionsGrid;
