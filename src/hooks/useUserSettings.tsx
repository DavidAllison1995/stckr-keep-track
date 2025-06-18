
import { useState, useEffect } from 'react';
import { UserSettings } from '@/types/settings';

const defaultSettings: UserSettings = {
  notifications: {
    taskDueSoon: true,
    taskOverdue: true,
    taskUpcoming: false,
  },
  calendar: {
    defaultView: 'month',
    dateFormat: 'MM/dd/yyyy',
  },
  pushNotifications: false,
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse user settings:', error);
      }
    }
  }, []);

  const updateSettings = async (newSettings: UserSettings) => {
    setIsLoading(true);
    try {
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: 'Failed to save settings' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    updateSettings,
    isLoading,
  };
};
