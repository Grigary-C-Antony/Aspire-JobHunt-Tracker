
export type ApplicationStatus = "applied" | "interviewing" | "offer" | "rejected";

export interface Reminder {
  id: string;
  applicationId: string;
  date: string; // ISO string
  description: string;
  isDone: boolean;
}

export interface JobApplication {
  id: string;
  companyName: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string; // ISO string
  dateUpdated: string; // ISO string
  location: string;
  jobDescription?: string;
  salary?: string;
  notes?: string;
  resumeVersion?: string;
  url?: string;
  contactEmail?: string;
  contactName?: string;
  tags: string[];
}

export interface ApplicationStats {
  totalApplications: number;
  statusCounts: Record<ApplicationStatus, number>;
  applicationsByDate: Record<string, number>; // Date string to count
  responseRate: number;
  averageDaysToResponse: number;
}
