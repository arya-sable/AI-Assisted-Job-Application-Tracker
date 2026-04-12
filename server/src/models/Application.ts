import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'Applied'
  | 'Phone Screen'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export type ApplicationPriority = 'High' | 'Medium' | 'Low';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  status: ApplicationStatus;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  priority: ApplicationPriority;
  jobSource?: string;
  contactName?: string;
  contactEmail?: string;
  nextAction?: string;
  nextActionDate?: string | null;
  isFavorite: boolean;
  deadlineDate?: string | null;
  interviewDate?: string | null;
  interviewMode?: string;
  resumeSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const dateOnlyValidator = (value?: string | null): boolean => (
  !value || /^\d{4}-\d{2}-\d{2}$/.test(value)
);

const optionalEmailValidator = (value?: string | null): boolean => (
  !value || /^\S+@\S+\.\S+$/.test(value)
);

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    jdLink: { type: String, trim: true },
    notes: { type: String },
    dateApplied: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    salaryRange: { type: String },
    requiredSkills: [{ type: String }],
    niceToHaveSkills: [{ type: String }],
    seniority: { type: String },
    location: { type: String },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    jobSource: { type: String, trim: true },
    contactName: { type: String, trim: true },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      validate: { validator: optionalEmailValidator, message: 'Contact email must be a valid email address' },
    },
    nextAction: { type: String, trim: true },
    nextActionDate: {
      type: String,
      trim: true,
      validate: { validator: dateOnlyValidator, message: 'Next action date must use YYYY-MM-DD' },
    },
    isFavorite: { type: Boolean, default: false },
    deadlineDate: {
      type: String,
      trim: true,
      validate: { validator: dateOnlyValidator, message: 'Deadline date must use YYYY-MM-DD' },
    },
    interviewDate: {
      type: String,
      trim: true,
      validate: { validator: dateOnlyValidator, message: 'Interview date must use YYYY-MM-DD' },
    },
    interviewMode: { type: String, trim: true },
    resumeSuggestions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>('Application', ApplicationSchema);
