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
  resumeSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
    contactEmail: { type: String, trim: true, lowercase: true },
    nextAction: { type: String, trim: true },
    nextActionDate: { type: String, trim: true },
    resumeSuggestions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IApplication>('Application', ApplicationSchema);
