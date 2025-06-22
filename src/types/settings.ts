
export interface UserSettings {
  notifications: {
    taskDueSoon: boolean;
    taskOverdue: boolean;
    warrantyExpiring: boolean;
    taskCompleted: boolean;
    taskCreated: boolean;
  };
  calendar: {
    defaultView: 'week' | 'month';
    dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy';
  };
  qrScanSound?: boolean;
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
