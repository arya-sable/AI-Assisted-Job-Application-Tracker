import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import ApplicationCard from './ApplicationCard';
import { APPLICATION_STATUSES } from '../../types';
import type { Application, ApplicationStatus } from '../../types';
import { useUpdateApplication } from '../../hooks/useApplications';

interface Props {
  applications: Application[];
}

export default function KanbanBoard({ applications }: Props) {
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const { mutate: updateApplication } = useUpdateApplication();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => {
        const app = applications.find((a) => a._id === e.active.id);
        setActiveApp(app ?? null);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto h-full pb-4">
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp && <ApplicationCard application={activeApp} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
