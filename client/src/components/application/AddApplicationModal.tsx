import { useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ResumeSuggestions from './ResumeSuggestions';
import { useAiParse } from '../../hooks/useAiParse';
import { useCreateApplication } from '../../hooks/useApplications';
import type { CreateApplicationInput } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddApplicationModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<'paste' | 'form'>('paste');
  const [jdText, setJdText] = useState('');
  const [resumeSuggestions, setResumeSuggestions] = useState<string[]>([]);
  const { parse, isLoading: isParsing, error: parseError, reset: resetParseError } = useAiParse();
  const { mutateAsync: createApp, isPending: isCreating } = useCreateApplication();

  const [formData, setFormData] = useState<CreateApplicationInput>({
    company: '',
    role: '',
    dateApplied: new Date().toISOString().split('T')[0],
    status: 'Applied',
    jdLink: '',
    notes: '',
    salaryRange: '',
    requiredSkills: [],
    niceToHaveSkills: [],
    seniority: '',
    location: '',
  });

  const handleParse = async () => {
    if (!jdText.trim()) {
      toast.error('Please paste a job description first');
      return;
    }
    const result = await parse(jdText);
    if (result) {
      setFormData((prev) => ({
        ...prev,
        company: result.companyName,
        role: result.role,
        location: result.location,
        requiredSkills: result.requiredSkills,
        niceToHaveSkills: result.niceToHaveSkills,
        seniority: result.seniority,
      }));
      setResumeSuggestions(result.resumeSuggestions);
      setStep('form');
    }
  };

  const handleManualEntry = () => {
    setStep('form');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role) {
      toast.error('Company and Role are required');
      return;
    }
    try {
      await createApp({
        ...formData,
        resumeSuggestions,
      });
      toast.success('Application saved!');
      handleClose();
    } catch {
      toast.error('Failed to save application');
    }
  };

  const handleClose = () => {
    setStep('paste');
    setJdText('');
    setResumeSuggestions([]);
    resetParseError();
    setFormData({
      company: '',
      role: '',
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'Applied',
      jdLink: '',
      notes: '',
      salaryRange: '',
      requiredSkills: [],
      niceToHaveSkills: [],
      seniority: '',
      location: '',
    });
    onClose();
  };

  const updateField = (field: keyof CreateApplicationInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Application">
      {step === 'paste' ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="jd-textarea" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Paste Job Description
            </label>
            <textarea
              id="jd-textarea"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              className="w-full h-48 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/15 resize-none"
            />
            {parseError && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{parseError}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleParse} isLoading={isParsing} className="flex-1">
              Parse with AI
            </Button>
            <Button variant="secondary" onClick={handleManualEntry} className="flex-1">
              Fill Manually
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
              required
            />
            <Input
              label="Role"
              value={formData.role}
              onChange={(e) => updateField('role', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              value={formData.location || ''}
              onChange={(e) => updateField('location', e.target.value)}
            />
            <Input
              label="Seniority"
              value={formData.seniority || ''}
              onChange={(e) => updateField('seniority', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date Applied"
              type="date"
              value={formData.dateApplied}
              onChange={(e) => updateField('dateApplied', e.target.value)}
            />
            <Input
              label="Salary Range"
              value={formData.salaryRange || ''}
              onChange={(e) => updateField('salaryRange', e.target.value)}
              placeholder="e.g. $80k-$100k"
            />
          </div>
          <Input
            label="JD Link"
            value={formData.jdLink || ''}
            onChange={(e) => updateField('jdLink', e.target.value)}
            placeholder="https://..."
          />
          <div>
            <label htmlFor="skills" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Required Skills
            </label>
            <input
              id="skills"
              value={formData.requiredSkills?.join(', ') || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  requiredSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                }))
              }
              placeholder="React, TypeScript, Node.js"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/15"
            />
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any notes about this application..."
              className="w-full h-20 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/15 resize-none"
            />
          </div>

          <ResumeSuggestions suggestions={resumeSuggestions} />

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isCreating} className="flex-1">
              Save Application
            </Button>
            <Button variant="secondary" type="button" onClick={() => setStep('paste')}>
              Back
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
