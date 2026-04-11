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
import { APPLICATION_STATUSES } from '../types';
import type { ApplicationStatus } from '../types';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

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
    });

    setIsEditing(true);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await updateApp({ id, data: formData });
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
            <Button variant="secondary" size="sm" onClick={startEditing}>
              Edit
            </Button>
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
                label="Salary Range"
                value={formData.salaryRange}
                onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
              />
              <Input
                label="JD Link"
                value={formData.jdLink}
                onChange={(e) => setFormData({ ...formData, jdLink: e.target.value })}
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
              <Badge status={application.status} />
            </div>

            <div className="grid grid-cols-2 gap-y-4 text-sm mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30">
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
              {application.salaryRange && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Salary</span>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{application.salaryRange}</p>
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
