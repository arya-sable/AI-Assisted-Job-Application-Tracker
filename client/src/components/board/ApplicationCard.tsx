import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import type { Application } from '../../types';
import { ShadBadge } from '../shadcn/badge';
import { getDaysSince, isFollowUpDue } from '../../utils/applicationMetrics';
import { Sparkles, Clock } from 'lucide-react';

interface Props {
  application: Application;
  isDragging?: boolean;
}

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
  const daysInPipeline = getDaysSince(application.dateApplied);
  const dragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group rounded-2xl border bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all dark:bg-slate-900 dark:border-slate-700/50 ${
        dragging
          ? 'opacity-40 scale-95'
          : 'hover:shadow-md'
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
        {followUpDue && (
          <div className="shrink-0">
            <Clock className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
          </div>
        )}
      </div>

      {/* Bottom row: badge + days */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
        <ShadBadge variant="outline" className="rounded-full text-[8px] px-2 uppercase tracking-widest font-bold">
          {application.seniority || application.status}
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
