import type { PipelineStats } from '../../utils/applicationMetrics';
import { BarChart3, TrendingUp, Trophy, Clock } from 'lucide-react';

interface Props {
  stats: PipelineStats;
}

export default function BoardInsights({ stats }: Props) {
  const insightCards = [
    {
      label: 'Total',
      value: stats.total,
      helper: `${stats.active} active`,
      icon: BarChart3,
    },
    {
      label: 'Response',
      value: `${stats.responseRate}%`,
      helper: `${stats.interviews} interviews`,
      icon: TrendingUp,
    },
    {
      label: 'Offers',
      value: `${stats.offerRate}%`,
      helper: `${stats.offers} received`,
      icon: Trophy,
    },
    {
      label: 'Follow-ups',
      value: stats.followUpsDue,
      helper: stats.followUpsDue > 0 ? 'Action needed' : 'All clear',
      alert: stats.followUpsDue > 0,
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {insightCards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 transition-colors ${
            card.alert
              ? 'border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10'
              : 'border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {card.label}
            </p>
            <card.icon className={`h-4 w-4 ${card.alert ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{card.value}</p>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{card.helper}</p>
        </div>
      ))}
    </div>
  );
}
