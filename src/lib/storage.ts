
import { ApplicationStats, JobApplication, Reminder } from "./types";

const APPLICATIONS_KEY = "aspire_job_applications";
const REMINDERS_KEY = "aspire_reminders";

// Initialize local storage with default data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(APPLICATIONS_KEY)) {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(REMINDERS_KEY)) {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify([]));
  }
};

// Job Application CRUD operations
export const getApplications = (): JobApplication[] => {
  initializeStorage();
  const data = localStorage.getItem(APPLICATIONS_KEY);
  return JSON.parse(data || "[]");
};

export const getApplicationById = (id: string): JobApplication | undefined => {
  const applications = getApplications();
  return applications.find(app => app.id === id);
};

export const saveApplication = (application: JobApplication): JobApplication => {
  const applications = getApplications();
  const existingIndex = applications.findIndex(app => app.id === application.id);
  
  if (existingIndex >= 0) {
    // Update existing application
    applications[existingIndex] = {
      ...application,
      dateUpdated: new Date().toISOString()
    };
  } else {
    // Add new application
    applications.push({
      ...application,
      dateApplied: application.dateApplied || new Date().toISOString(),
      dateUpdated: new Date().toISOString()
    });
  }
  
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
  return application;
};

export const deleteApplication = (id: string): void => {
  const applications = getApplications();
  const filtered = applications.filter(app => app.id !== id);
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(filtered));
  
  // Also delete associated reminders
  const reminders = getReminders();
  const filteredReminders = reminders.filter(reminder => reminder.applicationId !== id);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(filteredReminders));
};

export const updateApplicationStatus = (
  id: string, 
  status: JobApplication["status"]
): JobApplication | undefined => {
  const applications = getApplications();
  const index = applications.findIndex(app => app.id === id);
  
  if (index >= 0) {
    applications[index] = {
      ...applications[index],
      status,
      dateUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
    return applications[index];
  }
  
  return undefined;
};

// Reminder CRUD operations
export const getReminders = (): Reminder[] => {
  initializeStorage();
  const data = localStorage.getItem(REMINDERS_KEY);
  return JSON.parse(data || "[]");
};

export const getRemindersByApplicationId = (applicationId: string): Reminder[] => {
  const reminders = getReminders();
  return reminders.filter(reminder => reminder.applicationId === applicationId);
};

export const saveReminder = (reminder: Reminder): Reminder => {
  const reminders = getReminders();
  const existingIndex = reminders.findIndex(r => r.id === reminder.id);
  
  if (existingIndex >= 0) {
    // Update existing reminder
    reminders[existingIndex] = reminder;
  } else {
    // Add new reminder
    reminders.push(reminder);
  }
  
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  return reminder;
};

export const deleteReminder = (id: string): void => {
  const reminders = getReminders();
  const filtered = reminders.filter(reminder => reminder.id !== id);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
};

export const toggleReminderDone = (id: string): Reminder | undefined => {
  const reminders = getReminders();
  const index = reminders.findIndex(reminder => reminder.id === id);
  
  if (index >= 0) {
    reminders[index] = {
      ...reminders[index],
      isDone: !reminders[index].isDone
    };
    
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
    return reminders[index];
  }
  
  return undefined;
};

// Statistics calculation
export const getApplicationStats = (): ApplicationStats => {
  const applications = getApplications();
  
  // Initialize with default values
  const stats: ApplicationStats = {
    totalApplications: applications.length,
    statusCounts: {
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0
    },
    applicationsByDate: {},
    responseRate: 0,
    averageDaysToResponse: 0
  };
  
  // Count applications by status
  applications.forEach(app => {
    stats.statusCounts[app.status]++;
    
    // Group by date (yyyy-MM-dd)
    const dateKey = new Date(app.dateApplied).toISOString().split('T')[0];
    stats.applicationsByDate[dateKey] = (stats.applicationsByDate[dateKey] || 0) + 1;
  });
  
  // Calculate response rate (anything other than "applied" status)
  const responsesReceived = stats.totalApplications - stats.statusCounts.applied;
  stats.responseRate = stats.totalApplications > 0 
    ? (responsesReceived / stats.totalApplications) * 100 
    : 0;
  
  // Calculate average days to response (for applications with responses)
  const applicationsWithResponses = applications.filter(app => app.status !== "applied");
  if (applicationsWithResponses.length > 0) {
    const totalDays = applicationsWithResponses.reduce((sum, app) => {
      const applied = new Date(app.dateApplied).getTime();
      const updated = new Date(app.dateUpdated).getTime();
      const daysDiff = (updated - applied) / (1000 * 60 * 60 * 24);
      return sum + daysDiff;
    }, 0);
    
    stats.averageDaysToResponse = totalDays / applicationsWithResponses.length;
  }
  
  return stats;
};
