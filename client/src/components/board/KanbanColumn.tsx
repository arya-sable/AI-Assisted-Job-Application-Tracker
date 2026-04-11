import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ApplicationCard from './ApplicationCard';
import type { Application, ApplicationStatus } from '../../types';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: 'bg-blue-100 text-blue-800',
  'Phone Screen': 'bg-yellow-100 text-yellow-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

interface Props {
  status: ApplicationStatus;
  applications: Application[];
}

export default function KanbanColumn({ status, applications }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-72 flex-shrink-0 rounded-xl bg-gray-50 transition-colors ${
        isOver ? 'bg-gray-100 ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h2 className="font-semibold text-sm text-gray-700">{status}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
          {applications.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto min-h-[100px]">
        <SortableContext
          items={applications.map((a) => a._id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <ApplicationCard key={app._id} application={app} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
