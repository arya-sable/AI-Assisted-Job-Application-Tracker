import type { PipelineStats } from '../../utils/applicationMetrics';
import { BarChart3, TrendingUp, Trophy, Clock, Flag, Star, CalendarDays, Gauge } from 'lucide-react';

interface Props {
  stats: PipelineStats;
  followUpsActive?: boolean;
  onFollowUpsClick?: () => void;
}

export default function BoardInsights({
  stats,
  followUpsActive = false,
  onFollowUpsClick,
}: Props) {
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
      label: 'Priority',
      value: stats.highPriority,
      helper: stats.highPriority > 0 ? 'High priority' : 'No hot leads',
      alert: stats.highPriority > 0,
      icon: Flag,
    },
    {
      label: 'Shortlist',
      value: stats.shortlisted,
      helper: stats.shortlisted > 0 ? 'Saved leads' : 'Nothing pinned',
      alert: stats.shortlisted > 0,
      icon: Star,
    },
    {
      label: 'Upcoming',
      value: stats.upcomingEvents,
      helper: stats.upcomingEvents > 0 ? 'Next 7 days' : 'No events',
      alert: stats.upcomingEvents > 0,
      icon: CalendarDays,
    },
    {
      label: 'Score',
      value: `${stats.averageScore}`,
      helper: 'Avg health',
      icon: Gauge,
    },
    {
      label: 'Follow-ups',
      value: stats.followUpsDue,
      helper: stats.nextActionsDue > 0 ? `${stats.nextActionsDue} due now` : 'All clear',
      alert: stats.followUpsDue > 0,
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
      {insightCards.map((card, i) => (
        (() => {
          const isFollowUpsCard = card.label === 'Follow-ups';
          const isInteractive = isFollowUpsCard && Boolean(onFollowUpsClick);
          const isActive = isFollowUpsCard && followUpsActive;

          const className = `min-h-[88px] rounded-xl border p-3 transition-all card-lift animate-pop-in text-left ${
            card.alert
              ? 'border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/10'
              : 'border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50'
          } ${isInteractive ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500' : ''} ${
            isActive ? 'ring-2 ring-teal-500/70' : ''
          }`;

          const content = (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {card.label}
                </p>
                <card.icon className={`h-4 w-4 ${card.alert ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600'}`} />
              </div>
              <p className="mt-1.5 text-2xl font-extrabold text-slate-900 dark:text-white">{card.value}</p>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{card.helper}</p>
            </>
          );

          if (!isInteractive) {
            return (
              <div
                key={card.label}
                className={className}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {content}
              </div>
            );
          }

          return (
            <button
              key={card.label}
              type="button"
              className={className}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={onFollowUpsClick}
              title="Toggle follow-up mode"
            >
              {content}
            </button>
          );
        })()
      ))}
    </div>
  );
}
