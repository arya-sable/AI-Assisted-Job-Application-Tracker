export const APPLICATION_STATUSES = [
  'Applied',
  'Phone Screen',
  'Interview',
  'Offer',
  'Rejected',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_PRIORITIES = ['High', 'Medium', 'Low'] as const;

export type ApplicationPriority = (typeof APPLICATION_PRIORITIES)[number];

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority?: string;
  location?: string;
  priority?: ApplicationPriority;
  jobSource?: string;
  contactName?: string;
  contactEmail?: string;
  nextAction?: string;
  nextActionDate?: string | null;
  isFavorite?: boolean;
  deadlineDate?: string | null;
  interviewDate?: string | null;
  interviewMode?: string;
  resumeSuggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationInput {
  company: string;
  role: string;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  status?: ApplicationStatus;
  salaryRange?: string;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  seniority?: string;
  location?: string;
  priority?: ApplicationPriority;
  jobSource?: string;
  contactName?: string;
  contactEmail?: string;
  nextAction?: string;
  nextActionDate?: string | null;
  isFavorite?: boolean;
  deadlineDate?: string | null;
  interviewDate?: string | null;
  interviewMode?: string;
  resumeSuggestions?: string[];
}

export interface UpdateApplicationInput {
  id: string;
  data: Partial<Omit<Application, '_id' | 'userId' | 'createdAt' | 'updatedAt'>>;
}

export interface ParsedJobDescription {
  companyName: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
  salaryRange: string;
  resumeSuggestions: string[];
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
  };
}

export interface ApiError {
  message: string;
}
