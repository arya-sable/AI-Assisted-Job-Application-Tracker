import { useState } from 'react';
import KanbanBoard from '../components/board/KanbanBoard';
import AddApplicationModal from '../components/application/AddApplicationModal';
import SkeletonCard from '../components/ui/SkeletonCard';
import Button from '../components/ui/Button';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import { APPLICATION_STATUSES } from '../types';

export default function BoardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: applications, isLoading, error } = useApplications();
  const { logout, user } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">Job Tracker</h1>
          <span className="text-xs text-gray-400">{user?.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            + Add Application
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Board */}
      <div className="flex-1 overflow-hidden p-6">
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto h-full">
            {APPLICATION_STATUSES.map((status) => (
              <div key={status} className="w-72 flex-shrink-0 rounded-xl bg-gray-50">
                <div className="p-3 border-b border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="p-2 space-y-2">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">Failed to load applications. Please refresh.</p>
          </div>
        ) : applications && applications.length > 0 ? (
          <KanbanBoard applications={applications} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No applications yet</h2>
            <p className="text-sm text-gray-500 mb-6">Add your first job application to get started</p>
            <Button onClick={() => setIsModalOpen(true)}>
              Add Your First Application
            </Button>
          </div>
        )}
      </div>

      <AddApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
