import { useState, FormEvent, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplication, useUpdateApplication, useDeleteApplication } from '../hooks/useApplications';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { SkillBadge } from '../components/ui/Badge';
import ResumeSuggestions from '../components/application/ResumeSuggestions';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
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

  useEffect(() => {
    if (application) {
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
    }
  }, [application]);

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
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 mb-4">Application not found</p>
        <Button onClick={() => navigate('/board')}>Back to Board</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/board')}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Board
        </button>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-8 px-6">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Application</h2>
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
                <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              <label htmlFor="edit-skills" className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
              <input
                id="edit-skills"
                value={formData.requiredSkills.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requiredSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={isUpdating}>Save Changes</Button>
              <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{application.company}</h2>
                <p className="text-lg text-gray-600">{application.role}</p>
              </div>
              <Badge status={application.status} />
            </div>

            <div className="grid grid-cols-2 gap-y-3 text-sm mb-6">
              {application.location && (
                <div>
                  <span className="text-gray-400">Location:</span>
                  <span className="ml-2 text-gray-700">{application.location}</span>
                </div>
              )}
              {application.seniority && (
                <div>
                  <span className="text-gray-400">Seniority:</span>
                  <span className="ml-2 text-gray-700">{application.seniority}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400">Applied:</span>
                <span className="ml-2 text-gray-700">{formatDate(application.dateApplied)}</span>
              </div>
              {application.salaryRange && (
                <div>
                  <span className="text-gray-400">Salary:</span>
                  <span className="ml-2 text-gray-700">{application.salaryRange}</span>
                </div>
              )}
              {application.jdLink && (
                <div className="col-span-2">
                  <span className="text-gray-400">JD Link:</span>
                  <a
                    href={application.jdLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:underline"
                  >
                    {application.jdLink}
                  </a>
                </div>
              )}
            </div>

            {application.requiredSkills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {application.requiredSkills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} />
                  ))}
                </div>
              </div>
            )}

            {application.niceToHaveSkills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Nice to Have</h3>
                <div className="flex flex-wrap gap-1">
                  {application.niceToHaveSkills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} variant="nice" />
                  ))}
                </div>
              </div>
            )}

            {application.notes && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.notes}</p>
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
