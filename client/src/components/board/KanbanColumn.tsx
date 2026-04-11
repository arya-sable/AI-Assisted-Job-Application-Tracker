import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ApplicationCard from './ApplicationCard';
import { ShadBadge } from '../shadcn/badge';
import type { Application, ApplicationStatus } from '../../types';

const COLUMN_CONFIG: Record<ApplicationStatus, { color: string; bgColor: string }> = {
  Applied: { color: 'bg-slate-500', bgColor: 'bg-slate-500/5 border-slate-500/20 dark:border-slate-500/30' },
  'Phone Screen': { color: 'bg-blue-500', bgColor: 'bg-blue-500/5 border-blue-500/20 dark:border-blue-500/30' },
  Interview: { color: 'bg-amber-500', bgColor: 'bg-amber-500/5 border-amber-500/20 dark:border-amber-500/30' },
  Offer: { color: 'bg-emerald-500', bgColor: 'bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/30' },
  Rejected: { color: 'bg-red-500', bgColor: 'bg-red-500/5 border-red-500/20 dark:border-red-500/30' },
};

interface Props {
  status: ApplicationStatus;
  applications: Application[];
  index: number;
}

export default function KanbanColumn({ status, applications, index }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 flex-shrink-0 flex-col rounded-3xl border-2 border-dashed p-3 transition-all duration-200 ${config.bgColor} ${
        isOver ? 'border-slate-400/50 bg-slate-100/80 dark:border-slate-400/40 dark:bg-slate-800/60' : ''
      }`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 px-2 py-3 mb-2">
        <div className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
        <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
          {status}
        </span>
        <ShadBadge variant="secondary" className="ml-auto rounded-full px-2 text-[10px] font-mono">
          {applications.length}
        </ShadBadge>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        <SortableContext
          items={applications.map((a) => a._id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <ApplicationCard key={app._id} application={app} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className={`flex items-center justify-center h-24 transition-colors ${
            isOver
              ? 'text-slate-500 dark:text-slate-400'
              : 'text-slate-300 dark:text-slate-600'
          }`}>
            <span className="text-[10px] uppercase tracking-widest font-bold">
              {isOver ? 'Release to drop' : 'Drop here'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
