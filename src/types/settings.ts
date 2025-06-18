export interface UserSettings {
  notifications: {
    taskDueSoon: boolean;
    taskOverdue: boolean;
    taskUpcoming: boolean;
  };
  calendar: {
    defaultView: 'week' | 'month';
    dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy';
  };
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
}

export interface ConnectedAccounts {
  google?: boolean;
  apple?: boolean;
}
