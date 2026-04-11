import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import type { Application } from '../../types';
import Badge from '../ui/Badge';
import { SkillBadge } from '../ui/Badge';
import { formatDate } from '../../utils/formatDate';

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-3 border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging || isSortableDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      onClick={() => navigate(`/applications/${application._id}`)}
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-sm text-gray-900 truncate">{application.company}</h3>
      </div>
      <p className="text-sm text-gray-600 truncate mb-1">{application.role}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        {application.location && <span>{application.location}</span>}
        {application.seniority && (
          <>
            {application.location && <span>·</span>}
            <span>{application.seniority}</span>
          </>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-2">Applied: {formatDate(application.dateApplied)}</p>
      {application.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {application.requiredSkills.slice(0, 3).map((skill) => (
            <SkillBadge key={skill} skill={skill} />
          ))}
          {application.requiredSkills.length > 3 && (
            <span className="text-xs text-gray-400">+{application.requiredSkills.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
