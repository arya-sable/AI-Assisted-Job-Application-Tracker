import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import ApplicationCard from './ApplicationCard';
import { APPLICATION_STATUSES } from '../../types';
import type { Application, ApplicationStatus } from '../../types';
import { useUpdateApplication } from '../../hooks/useApplications';
import toast from 'react-hot-toast';

interface Props {
  applications: Application[];
}

export default function KanbanBoard({ applications }: Props) {
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const { mutate: updateApplication } = useUpdateApplication();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a._id === event.active.id);
    setActiveApp(app ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const draggedId = active.id as string;
    const newStatus = over.id as ApplicationStatus;

    if (!APPLICATION_STATUSES.includes(newStatus)) return;

    const app = applications.find((a) => a._id === draggedId);
    if (!app || app.status === newStatus) return;

    updateApplication({ id: draggedId, data: { status: newStatus } });
    toast.success(`Moved ${app.company} to ${newStatus}`);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-5 gap-2.5 h-full min-w-[900px] lg:min-w-0">
        {APPLICATION_STATUSES.map((status, i) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
            index={i}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeApp && (
          <div className="rotate-2 scale-105 opacity-90 shadow-2xl">
            <ApplicationCard application={activeApp} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
