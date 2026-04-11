import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import KanbanBoard from '../components/board/KanbanBoard';
import BoardInsights from '../components/board/BoardInsights';
import AddApplicationModal from '../components/application/AddApplicationModal';
import SkeletonCard from '../components/ui/SkeletonCard';
import { ShadButton } from '../components/shadcn/button';
import { Separator } from '../components/shadcn/separator';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { APPLICATION_STATUSES, type ApplicationStatus } from '../types';
import { calculatePipelineStats, isFollowUpDue } from '../utils/applicationMetrics';
import {
  Briefcase,
  Plus,
  Download,
  LogOut,
  Search,
  X,
  Sun,
  Moon,
} from 'lucide-react';

type StatusFilter = 'All' | ApplicationStatus;
type SortMode = 'newest' | 'oldest' | 'company-asc' | 'company-desc';

const toCsvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`;

export default function BoardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [followUpsOnly, setFollowUpsOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: applications, isLoading, error } = useApplications();
  const { logout, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore when typing in an input/textarea
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setIsModalOpen(true);
    }
    if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      searchRef.current?.focus();
    }
    if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      toggleTheme();
    }
  }, [toggleTheme]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const allApplications = useMemo(() => applications ?? [], [applications]);
  const stats = useMemo(
    () => calculatePipelineStats(allApplications),
    [allApplications]
  );

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = allApplications.filter((app) => {
      const queryMatch =
        normalizedQuery.length === 0 ||
        [
          app.company,
          app.role,
          app.location,
          app.seniority,
          app.status,
          app.requiredSkills.join(' '),
          app.niceToHaveSkills.join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const statusMatch = statusFilter === 'All' || app.status === statusFilter;
      const followUpMatch = !followUpsOnly || isFollowUpDue(app);

      return queryMatch && statusMatch && followUpMatch;
    });

    filtered.sort((a, b) => {
      switch (sortMode) {
        case 'oldest':
          return new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
        case 'company-asc':
          return a.company.localeCompare(b.company);
        case 'company-desc':
          return b.company.localeCompare(a.company);
        case 'newest':
        default:
          return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
      }
    });

    return filtered;
  }, [allApplications, query, statusFilter, followUpsOnly, sortMode]);

  const hasActiveFilters =
    query.trim().length > 0 || statusFilter !== 'All' || followUpsOnly;

  const exportCsv = () => {
    if (filteredApplications.length === 0) {
      toast.error('No applications to export with current filters');
      return;
    }

    const headers = [
      'Company',
      'Role',
      'Status',
      'Date Applied',
      'Location',
      'Seniority',
      'Salary Range',
      'JD Link',
      'Required Skills',
      'Nice To Have Skills',
      'Notes',
    ];

    const rows = filteredApplications.map((app) =>
      [
        app.company,
        app.role,
        app.status,
        app.dateApplied.slice(0, 10),
        app.location ?? '',
        app.seniority ?? '',
        app.salaryRange ?? '',
        app.jdLink ?? '',
        app.requiredSkills.join(' | '),
        app.niceToHaveSkills.join(' | '),
        app.notes ?? '',
      ]
        .map((value) => toCsvValue(value))
        .join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Applications exported to CSV');
  };

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('All');
    setFollowUpsOnly(false);
    setSortMode('newest');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80 animate-slide-down">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
              <Briefcase className="h-4 w-4 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              Pipeline
            </h1>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
              {user?.email}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShadButton variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </ShadButton>
            <ShadButton variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" />
              Export
            </ShadButton>
            <ShadButton size="sm" onClick={() => setIsModalOpen(true)} title="Add application (N)">
              <Plus className="h-3.5 w-3.5" />
              Add
            </ShadButton>
            <ShadButton variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
            </ShadButton>
          </div>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-6 pt-4 md:px-6 space-y-4">
        {!isLoading && !error && <BoardInsights stats={stats} />}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company, role, skill...  ( / )"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition-all input-focus-glow focus:border-slate-400 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All statuses</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="company-asc">A-Z</option>
            <option value="company-desc">Z-A</option>
          </select>

          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <input
              type="checkbox"
              checked={followUpsOnly}
              onChange={(e) => setFollowUpsOnly(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600"
            />
            Follow-ups
          </label>

          {hasActiveFilters && (
            <ShadButton variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              Clear
            </ShadButton>
          )}
        </div>

        {/* Board */}
        <div className="h-[calc(100vh-200px)] overflow-x-auto pb-4">
          {isLoading ? (
            <div className="grid grid-cols-5 gap-2.5 h-full min-w-[900px]">
              {APPLICATION_STATUSES.map((status) => (
                <div key={status} className="rounded-3xl border-2 border-dashed border-slate-200/50 dark:border-slate-700/30 p-3">
                  <div className="px-2 py-3 mb-2">
                    <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm font-medium text-red-500 dark:text-red-400">
                Failed to load applications. Please refresh.
              </p>
            </div>
          ) : allApplications.length > 0 ? (
            <div className="flex flex-col h-full gap-3">
              {filteredApplications.length === 0 && hasActiveFilters && (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-800/40 dark:bg-amber-900/10">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    No applications match the current filters.
                  </p>
                  <ShadButton variant="outline" size="sm" onClick={clearFilters} className="h-7 text-xs">
                    Reset Filters
                  </ShadButton>
                </div>
              )}
              <div className="flex-1 min-h-0">
                <KanbanBoard applications={filteredApplications} />
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800">
                <Briefcase className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">No applications yet</h2>
              <p className="mb-6 mt-1 text-sm text-slate-500 dark:text-slate-400">
                Add your first job application to start tracking.
              </p>
              <ShadButton onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Your First Application
              </ShadButton>
            </div>
          )}
        </div>
      </div>

      <AddApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
