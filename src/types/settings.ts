
export interface UserSettings {
  notifications: {
    taskDueSoon: boolean;
    taskOverdue: boolean;
    warrantyExpiring: boolean;
    taskCompleted: boolean;
    taskCreated: boolean;
  };
  showCompletedTasks: boolean;
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
