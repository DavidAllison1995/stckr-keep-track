
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
  theme: 'system',
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme to document
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        applyTheme(parsedSettings.theme || 'system');
      } catch (error) {
        console.error('Failed to parse user settings:', error);
        applyTheme(defaultSettings.theme);
      }
    } else {
      applyTheme(defaultSettings.theme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const updateSettings = async (newSettings: UserSettings) => {
    setIsLoading(true);
    try {
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      applyTheme(newSettings.theme);
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
