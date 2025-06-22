
import React, { createContext, useContext } from 'react';
import { useUserSettings, UserSettings } from '@/hooks/useUserSettings';

interface UserSettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: UserSettings) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const userSettingsHook = useUserSettings();

  return (
    <UserSettingsContext.Provider value={userSettingsHook}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettingsContext = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettingsContext must be used within a UserSettingsProvider');
  }
  return context;
};
