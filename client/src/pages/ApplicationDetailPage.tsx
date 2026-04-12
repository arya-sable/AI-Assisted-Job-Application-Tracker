import { useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplication, useUpdateApplication, useDeleteApplication } from '../hooks/useApplications';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { SkillBadge } from '../components/ui/Badge';
import ResumeSuggestions from '../components/application/ResumeSuggestions';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import ThemeToggle from '../components/ui/ThemeToggle';
import { APPLICATION_PRIORITIES, APPLICATION_STATUSES } from '../types';
import type { ApplicationPriority, ApplicationStatus } from '../types';
import { formatDate } from '../utils/formatDate';
import { calculateApplicationScore, getDaysUntil, getUpcomingEvent } from '../utils/applicationMetrics';
import { normalizeSalaryRange } from '../utils/salaryFormatting';
import toast from 'react-hot-toast';

const PRIORITY_BADGE_CLASSES: Record<ApplicationPriority, string> = {
  High: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300',
  Low: 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: application, isLoading } = useApplication(id!);
  const { mutateAsync: updateApp, isPending: isUpdating } = useUpdateApplication();
  const { mutateAsync: deleteApp, isPending: isDeleting } = useDeleteApplication();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Applied' as ApplicationStatus,
    location: '',
    seniority: '',
    dateApplied: '',
    salaryRange: '',
    jdLink: '',
    notes: '',
    requiredSkills: [] as string[],
    niceToHaveSkills: [] as string[],
    priority: 'Medium' as ApplicationPriority,
    jobSource: '',
    contactName: '',
    contactEmail: '',
    nextAction: '',
    nextActionDate: '',
    isFavorite: false,
    deadlineDate: '',
    interviewDate: '',
    interviewMode: '',
  });

  const startEditing = () => {
    if (!application) return;

    setFormData({
      company: application.company,
      role: application.role,
      status: application.status,
      location: application.location || '',
      seniority: application.seniority || '',
      dateApplied: application.dateApplied.split('T')[0],
      salaryRange: application.salaryRange || '',
      jdLink: application.jdLink || '',
      notes: application.notes || '',
      requiredSkills: application.requiredSkills,
      niceToHaveSkills: application.niceToHaveSkills,
      priority: application.priority ?? 'Medium',
      jobSource: application.jobSource || '',
      contactName: application.contactName || '',
      contactEmail: application.contactEmail || '',
      nextAction: application.nextAction || '',
      nextActionDate: application.nextActionDate || '',
      isFavorite: Boolean(application.isFavorite),
      deadlineDate: application.deadlineDate || '',
      interviewDate: application.interviewDate || '',
      interviewMode: application.interviewMode || '',
    });

    setIsEditing(true);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateApp({
        id,
        data: {
          ...formData,
          salaryRange: normalizeSalaryRange(formData.salaryRange, formData.location),
        },
      });
      toast.success('Application updated!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update application');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteApp(id);
      toast.success('Application deleted');
      navigate('/board');
    } catch {
      toast.error('Failed to delete application');
    }
  };

  const toggleFavorite = async () => {
    if (!id || !application) return;

    try {
      await updateApp({ id, data: { isFavorite: !application.isFavorite } });
      toast.success(application.isFavorite ? 'Removed from shortlist' : 'Added to shortlist');
    } catch {
      toast.error('Failed to update shortlist');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Application not found</p>
        <Button onClick={() => navigate('/board')}>Back to Board</Button>
      </div>
    );
  }

  const displaySalaryRange = normalizeSalaryRange(application.salaryRange || '', application.location || '');
  const priority = application.priority ?? 'Medium';
  const score = calculateApplicationScore(application);
  const upcomingEvent = getUpcomingEvent(application);
  const nextActionDays = getDaysUntil(application.nextActionDate);
  const nextActionTiming = nextActionDays === null
    ? ''
    : nextActionDays < 0
      ? `${Math.abs(nextActionDays)} days overdue`
      : nextActionDays === 0
        ? 'Due today'
        : `Due in ${nextActionDays} days`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 theme-transition">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between dark:bg-slate-800/80 dark:border-slate-700">
        <button
          onClick={() => navigate('/board')}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Board
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isEditing && (
            <>
              <Button variant="secondary" size="sm" onClick={toggleFavorite}>
                {application.isFavorite ? 'Unshortlist' : 'Shortlist'}
              </Button>
              <Button variant="secondary" size="sm" onClick={startEditing}>
                Edit
              </Button>
            </>
          )}
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-8 px-6 animate-fade-in-up">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Edit Application</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
              <Input
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority-select" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <select
                  id="priority-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as ApplicationPriority })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-teal-400 dark:focus:ring-teal-400/15"
                >
                  {APPLICATION_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Source"
                value={formData.jobSource}
                onChange={(e) => setFormData({ ...formData, jobSource: e.target.value })}
                placeholder="LinkedIn, referral, careers page"
              />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              <span>Pin to shortlist</span>
              <input
                type="checkbox"
                checked={formData.isFavorite}
                onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                className="h-4 w-4 accent-teal-600"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status-select" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  id="status-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-teal-400 dark:focus:ring-teal-400/15"
                >
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Seniority"
                value={formData.seniority}
                onChange={(e) => setFormData({ ...formData, seniority: e.target.value })}
              />
              <Input
                label="Date Applied"
                type="date"
                value={formData.dateApplied}
                onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contact Name"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Recruiter or hiring manager"
              />
              <Input
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="name@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Salary Range"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                onBlur={(e) =>
                  setFormData({
                    ...formData,
                    salaryRange: normalizeSalaryRange(e.target.value, formData.location),
                  })
                }
              />
              <Input
                label="JD Link"
                value={formData.jdLink}
                onChange={(e) => setFormData({ ...formData, jdLink: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Application Deadline"
                type="date"
                value={formData.deadlineDate}
                onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
              />
              <Input
                label="Interview Date"
                type="date"
                value={formData.interviewDate}
                onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
              />
            </div>
            <Input
              label="Interview Mode"
              value={formData.interviewMode}
              onChange={(e) => setFormData({ ...formData, interviewMode: e.target.value })}
              placeholder="Zoom, phone, onsite, take-home"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Next Action"
                value={formData.nextAction}
                onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                placeholder="Follow up with recruiter"
              />
              <Input
                label="Next Action Date"
                type="date"
                value={formData.nextActionDate}
                onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="edit-skills" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Skills</label>
              <input
                id="edit-skills"
                value={formData.requiredSkills.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requiredSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-teal-400 dark:focus:ring-teal-400/15"
              />
            </div>
            <div>
              <label htmlFor="edit-notes" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
              <textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full h-24 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-teal-400 dark:focus:ring-teal-400/15 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
              <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{application.company}</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400">{application.role}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {application.isFavorite && (
                  <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-0.5 text-xs font-bold text-yellow-700 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-300">
                    Shortlisted
                  </span>
                )}
                <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 dark:border-teal-900/40 dark:bg-teal-900/20 dark:text-teal-300">
                  Score {score}
                </span>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${PRIORITY_BADGE_CLASSES[priority]}`}>
                  {priority} priority
                </span>
                <Badge status={application.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 text-sm mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30">
              {upcomingEvent && (
                <div className="col-span-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 dark:border-teal-800/40 dark:bg-teal-900/10">
                  <span className="text-slate-400 dark:text-slate-500">Upcoming</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {upcomingEvent.label} on {formatDate(`${upcomingEvent.date}T00:00:00`)}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-300">
                    {upcomingEvent.daysUntil < 0
                      ? `${Math.abs(upcomingEvent.daysUntil)} days overdue`
                      : upcomingEvent.daysUntil === 0
                        ? 'Today'
                        : `In ${upcomingEvent.daysUntil} days`}
                  </p>
                </div>
              )}
              <div>
                <span className="text-slate-400 dark:text-slate-500">Priority</span>
                <p className="font-medium text-slate-700 dark:text-slate-200">{priority}</p>
              </div>
              {application.location && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Location</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{application.location}</p>
                </div>
              )}
              {application.seniority && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Seniority</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{application.seniority}</p>
                </div>
              )}
              <div>
                <span className="text-slate-400 dark:text-slate-500">Applied</span>
                <p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(application.dateApplied)}</p>
              </div>
              {displaySalaryRange && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Salary</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{displaySalaryRange}</p>
                </div>
              )}
              {application.deadlineDate && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Application Deadline</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {formatDate(`${application.deadlineDate}T00:00:00`)}
                  </p>
                </div>
              )}
              {(application.interviewDate || application.interviewMode) && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Interview</span>
                  {application.interviewDate && (
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {formatDate(`${application.interviewDate}T00:00:00`)}
                    </p>
                  )}
                  {application.interviewMode && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{application.interviewMode}</p>
                  )}
                </div>
              )}
              {application.jobSource && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Source</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{application.jobSource}</p>
                </div>
              )}
              {(application.contactName || application.contactEmail) && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Contact</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {application.contactName || 'Recruiter'}
                  </p>
                  {application.contactEmail && (
                    <a
                      href={`mailto:${application.contactEmail}`}
                      className="text-xs font-medium text-teal-600 hover:underline dark:text-teal-400"
                    >
                      {application.contactEmail}
                    </a>
                  )}
                </div>
              )}
              {(application.nextAction || application.nextActionDate) && (
                <div className="col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800/40 dark:bg-amber-900/10">
                  <span className="text-slate-400 dark:text-slate-500">Next Action</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {application.nextAction || 'Follow up'}
                  </p>
                  {nextActionTiming && (
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-300">
                      {nextActionTiming}
                    </p>
                  )}
                </div>
              )}
              {application.jdLink && (
                <div className="col-span-2">
                  <span className="text-slate-400 dark:text-slate-500">JD Link</span>
                  <p>
                    <a
                      href={application.jdLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-teal-600 hover:underline dark:text-teal-400"
                    >
                      {application.jdLink}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {application.requiredSkills.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {application.requiredSkills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} />
                  ))}
                </div>
              </div>
            )}

            {application.niceToHaveSkills.length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Nice to Have</h3>
                <div className="flex flex-wrap gap-1.5">
                  {application.niceToHaveSkills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} variant="nice" />
                  ))}
                </div>
              </div>
            )}

            {application.notes && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Notes</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{application.notes}</p>
              </div>
            )}

            <ResumeSuggestions suggestions={application.resumeSuggestions} />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Application"
        message={`Are you sure you want to delete your application to ${application.company}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
