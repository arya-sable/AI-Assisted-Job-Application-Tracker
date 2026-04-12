import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import type { Application, ApplicationPriority } from '../../types';
import { ShadBadge } from '../shadcn/badge';
import { getDaysSince, getDaysUntil, isFollowUpDue, isNextActionDue } from '../../utils/applicationMetrics';
import { Sparkles, Clock, Flag } from 'lucide-react';

interface Props {
  application: Application;
  isDragging?: boolean;
}

const PRIORITY_COLORS: Record<ApplicationPriority, string> = {
  High: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300',
  Low: 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export default function ApplicationCard({ application, isDragging = false }: Props) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: application._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const followUpDue = isFollowUpDue(application);
  const nextActionDue = isNextActionDue(application);
  const nextActionDays = getDaysUntil(application.nextActionDate);
  const nextActionLabel = nextActionDays === null
    ? ''
    : nextActionDays < 0
      ? `${Math.abs(nextActionDays)}d late`
      : nextActionDays === 0
        ? 'today'
        : `${nextActionDays}d`;
  const daysInPipeline = getDaysSince(application.dateApplied);
  const dragging = isDragging || isSortableDragging;
  const priority = application.priority ?? 'Medium';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group rounded-2xl border bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all card-lift dark:bg-slate-900 dark:border-slate-700/50 animate-card-enter ${
        dragging
          ? 'opacity-40 scale-95 !shadow-none'
          : ''
      }`}
      onClick={() => navigate(`/applications/${application._id}`)}
    >
      {/* Top row: company + follow-up indicator */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs truncate text-slate-900 dark:text-slate-100" title={application.company}>
            {application.company}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{application.role}</p>
        </div>
        {priority === 'High' && (
          <div className="shrink-0">
            <Flag className="h-3.5 w-3.5 text-rose-500" />
          </div>
        )}
        {followUpDue && (
          <div className="shrink-0">
            <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          </div>
        )}
      </div>

      {(application.nextAction || application.nextActionDate) && (
        <div className={`mt-2 rounded-lg border px-2 py-1.5 text-[10px] ${
          nextActionDue
            ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300'
            : 'border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-400'
        }`}>
          <p className="truncate font-semibold">
            {application.nextAction || 'Next action'}
          </p>
          {nextActionLabel && (
            <p className="mt-0.5 font-mono uppercase tracking-widest">
              {nextActionLabel}
            </p>
          )}
        </div>
      )}

      {/* Bottom row: badge + days */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
        <ShadBadge variant="outline" className={`rounded-full text-[8px] px-2 uppercase tracking-widest font-bold ${PRIORITY_COLORS[priority]}`}>
          {priority}
        </ShadBadge>
        <span className={`text-xs font-mono font-black ${
          followUpDue ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'
        }`}>
          {daysInPipeline}d
        </span>
      </div>

      {/* Skills preview */}
      {application.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {application.requiredSkills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              {skill}
            </span>
          ))}
          {application.requiredSkills.length > 2 && (
            <span className="text-[9px] text-slate-400 dark:text-slate-500 self-center">
              +{application.requiredSkills.length - 2}
            </span>
          )}
        </div>
      )}

      {/* AI enriched indicator */}
      {application.resumeSuggestions.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 text-[9px] text-amber-500 font-bold">
          <Sparkles className="h-2.5 w-2.5" />
          AI Enriched
        </div>
      )}
    </div>
  );
}
