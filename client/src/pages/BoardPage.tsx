import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/board/KanbanBoard';
import BoardInsights from '../components/board/BoardInsights';
import AddApplicationModal from '../components/application/AddApplicationModal';
import SkeletonCard from '../components/ui/SkeletonCard';
import { ShadButton } from '../components/shadcn/button';
import { Separator } from '../components/shadcn/separator';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { APPLICATION_PRIORITIES, APPLICATION_STATUSES, type ApplicationPriority, type ApplicationStatus } from '../types';
import {
  calculateApplicationScore,
  calculatePipelineStats,
  getDaysSince,
  getDaysUntil,
  getUpcomingEvent,
  hasUpcomingEvent,
  isFollowUpDue,
  PRIORITY_WEIGHT,
} from '../utils/applicationMetrics';
import {
  Briefcase,
  Plus,
  Download,
  LogOut,
  Search,
  X,
  Sun,
  Moon,
  Clock3,
  ArrowRight,
  Star,
  CalendarDays,
} from 'lucide-react';

type StatusFilter = 'All' | ApplicationStatus;
type PriorityFilter = 'All' | ApplicationPriority;
type SortMode =
  | 'newest'
  | 'oldest'
  | 'company-asc'
  | 'company-desc'
  | 'priority'
  | 'next-action'
  | 'deadline'
  | 'interview'
  | 'upcoming'
  | 'score';

const toCsvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`;

export default function BoardPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
  const [followUpsOnly, setFollowUpsOnly] = useState(false);
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [upcomingOnly, setUpcomingOnly] = useState(false);
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
          app.priority,
          app.jobSource,
          app.contactName,
          app.contactEmail,
          app.nextAction,
          app.interviewMode,
          app.requiredSkills.join(' '),
          app.niceToHaveSkills.join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const statusMatch = statusFilter === 'All' || app.status === statusFilter;
      const priorityMatch = priorityFilter === 'All' || (app.priority ?? 'Medium') === priorityFilter;
      const followUpMatch = !followUpsOnly || isFollowUpDue(app);
      const shortlistMatch = !shortlistOnly || Boolean(app.isFavorite);
      const upcomingMatch = !upcomingOnly || hasUpcomingEvent(app);

      return queryMatch && statusMatch && priorityMatch && followUpMatch && shortlistMatch && upcomingMatch;
    });

    filtered.sort((a, b) => {
      const aDate = new Date(a.dateApplied).getTime();
      const bDate = new Date(b.dateApplied).getTime();

      switch (sortMode) {
        case 'oldest':
          return aDate - bDate;
        case 'company-asc':
          return a.company.localeCompare(b.company);
        case 'company-desc':
          return b.company.localeCompare(a.company);
        case 'priority':
          return (
            PRIORITY_WEIGHT[b.priority ?? 'Medium'] - PRIORITY_WEIGHT[a.priority ?? 'Medium'] ||
            bDate - aDate
          );
        case 'next-action': {
          const aDays = getDaysUntil(a.nextActionDate) ?? Number.POSITIVE_INFINITY;
          const bDays = getDaysUntil(b.nextActionDate) ?? Number.POSITIVE_INFINITY;
          return aDays - bDays || aDate - bDate;
        }
        case 'deadline': {
          const aDays = getDaysUntil(a.deadlineDate) ?? Number.POSITIVE_INFINITY;
          const bDays = getDaysUntil(b.deadlineDate) ?? Number.POSITIVE_INFINITY;
          return aDays - bDays || aDate - bDate;
        }
        case 'interview': {
          const aDays = getDaysUntil(a.interviewDate) ?? Number.POSITIVE_INFINITY;
          const bDays = getDaysUntil(b.interviewDate) ?? Number.POSITIVE_INFINITY;
          return aDays - bDays || aDate - bDate;
        }
        case 'upcoming': {
          const aEventDays = getUpcomingEvent(a)?.daysUntil ?? Number.POSITIVE_INFINITY;
          const bEventDays = getUpcomingEvent(b)?.daysUntil ?? Number.POSITIVE_INFINITY;
          return aEventDays - bEventDays || aDate - bDate;
        }
        case 'score':
          return calculateApplicationScore(b) - calculateApplicationScore(a) || bDate - aDate;
        case 'newest':
        default:
          return bDate - aDate;
      }
    });

    return filtered;
  }, [allApplications, query, statusFilter, priorityFilter, followUpsOnly, shortlistOnly, upcomingOnly, sortMode]);

  const followUpQueue = useMemo(
    () =>
      allApplications
        .filter((app) => isFollowUpDue(app))
        .sort((a, b) => {
          const aDue = getDaysUntil(a.nextActionDate) ?? Number.POSITIVE_INFINITY;
          const bDue = getDaysUntil(b.nextActionDate) ?? Number.POSITIVE_INFINITY;
          return aDue - bDue || new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
        }),
    [allApplications]
  );

  const nextFollowUp = followUpQueue[0];

  const hasActiveFilters =
    query.trim().length > 0 ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All' ||
    followUpsOnly ||
    shortlistOnly ||
    upcomingOnly;

  const exportCsv = () => {
    if (filteredApplications.length === 0) {
      toast.error('No applications to export with current filters');
      return;
    }

    const headers = [
      'Company',
      'Role',
      'Status',
      'Priority',
      'Shortlisted',
      'Score',
      'Date Applied',
      'Location',
      'Seniority',
      'Salary Range',
      'Application Deadline',
      'Interview Date',
      'Interview Mode',
      'Source',
      'Contact',
      'Contact Email',
      'Next Action',
      'Next Action Date',
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
        app.priority ?? 'Medium',
        app.isFavorite ? 'Yes' : 'No',
        String(calculateApplicationScore(app)),
        app.dateApplied.slice(0, 10),
        app.location ?? '',
        app.seniority ?? '',
        app.salaryRange ?? '',
        app.deadlineDate ?? '',
        app.interviewDate ?? '',
        app.interviewMode ?? '',
        app.jobSource ?? '',
        app.contactName ?? '',
        app.contactEmail ?? '',
        app.nextAction ?? '',
        app.nextActionDate ?? '',
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

  const toggleFollowUps = () => {
    if (followUpQueue.length === 0) {
      setFollowUpsOnly(false);
      toast('No follow-ups are due right now');
      return;
    }

    const nextMode = !followUpsOnly;
    setFollowUpsOnly(nextMode);

    if (nextMode) {
      setQuery('');
      setStatusFilter('All');
      setPriorityFilter('All');
      setShortlistOnly(false);
      setUpcomingOnly(false);
      setSortMode('next-action');
      toast.success(
        `Showing ${followUpQueue.length} follow-up${followUpQueue.length === 1 ? '' : 's'} due`
      );
    }
  };

  const openNextFollowUp = () => {
    if (!nextFollowUp) {
      toast('No follow-ups are due right now');
      return;
    }

    navigate(`/applications/${nextFollowUp._id}`);
  };

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setFollowUpsOnly(false);
    setShortlistOnly(false);
    setUpcomingOnly(false);
    setSortMode('newest');
  };

  const nextFollowUpDaysUntil = nextFollowUp ? getDaysUntil(nextFollowUp.nextActionDate) : null;
  const nextFollowUpTiming = nextFollowUpDaysUntil === null
    ? `${getDaysSince(nextFollowUp?.dateApplied ?? '')} days since applied`
    : nextFollowUpDaysUntil < 0
      ? `${Math.abs(nextFollowUpDaysUntil)} days overdue`
      : nextFollowUpDaysUntil === 0
        ? 'due today'
        : `due in ${nextFollowUpDaysUntil} days`;

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
        {!isLoading && !error && (
          <BoardInsights
            stats={stats}
            followUpsActive={followUpsOnly}
            onFollowUpsClick={toggleFollowUps}
          />
        )}

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
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All priorities</option>
            {APPLICATION_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
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
            <option value="priority">Priority</option>
            <option value="next-action">Next action</option>
            <option value="deadline">Deadline</option>
            <option value="interview">Interview</option>
            <option value="upcoming">Upcoming event</option>
            <option value="score">Score</option>
          </select>

          <ShadButton
            type="button"
            variant={shortlistOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShortlistOnly((current) => !current)}
            className="h-9"
            title="Show shortlisted applications"
          >
            <Star className="h-3.5 w-3.5" />
            Shortlist
          </ShadButton>

          <ShadButton
            type="button"
            variant={upcomingOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setUpcomingOnly((current) => {
                const next = !current;
                if (next) setSortMode('upcoming');
                return next;
              });
            }}
            className="h-9"
            title="Show interviews, deadlines, and next actions in the next 7 days"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Upcoming
          </ShadButton>

          <ShadButton
            type="button"
            variant={followUpsOnly ? 'default' : 'outline'}
            size="sm"
            onClick={toggleFollowUps}
            className="h-9"
            title="Show applications that need follow-up"
          >
            <Clock3 className="h-3.5 w-3.5" />
            Follow-ups {followUpQueue.length > 0 ? `(${followUpQueue.length})` : ''}
          </ShadButton>

          <ShadButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={openNextFollowUp}
            disabled={!nextFollowUp}
            title="Open the oldest pending follow-up"
          >
            Next
            <ArrowRight className="h-3.5 w-3.5" />
          </ShadButton>

          {hasActiveFilters && (
            <ShadButton variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              Clear
            </ShadButton>
          )}
        </div>

        {followUpsOnly && nextFollowUp && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-800/40 dark:bg-amber-900/10">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Follow-up mode is on. Next: <span className="font-semibold">{nextFollowUp.company}</span>
              {nextFollowUp.nextAction ? ` - ${nextFollowUp.nextAction}` : ''} ({nextFollowUpTiming})
            </p>
            <ShadButton type="button" variant="outline" size="sm" onClick={openNextFollowUp}>
              Open Next
            </ShadButton>
          </div>
        )}

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
