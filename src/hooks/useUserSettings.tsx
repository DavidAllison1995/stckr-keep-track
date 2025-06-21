
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface UserSettings {
  notifications: {
    taskDueSoon: boolean;
    taskOverdue: boolean;
    taskUpcoming: boolean;
    warrantyExpiring: boolean;
    taskCompleted: boolean;
    taskCreated: boolean;
  };
  calendar: {
    defaultView: 'week' | 'month';
    dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy';
  };
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

const defaultSettings: UserSettings = {
  notifications: {
    taskDueSoon: true,
    taskOverdue: true,
    taskUpcoming: false,
    warrantyExpiring: true,
    taskCompleted: false,
    taskCreated: false,
  },
  calendar: {
    defaultView: 'month',
    dateFormat: 'MM/dd/yyyy',
  },
  pushNotifications: false,
  theme: 'system',
};

export const useUserSettings = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

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

  const { data: settings = defaultSettings, isLoading } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: async () => {
      if (!user?.id) return defaultSettings;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return defaultSettings;
      }

      if (!data) return defaultSettings;

      // Map database fields to frontend structure
      const mappedSettings: UserSettings = {
        notifications: {
          taskDueSoon: data.notification_task_due_soon ?? true,
          taskOverdue: data.notification_task_overdue ?? true,
          taskUpcoming: data.notification_task_upcoming ?? false,
          warrantyExpiring: data.notification_warranty_expiring ?? true,
          taskCompleted: data.notification_task_completed ?? false,
          taskCreated: data.notification_task_created ?? false,
        },
        calendar: {
          defaultView: 'month',
          dateFormat: 'MM/dd/yyyy',
        },
        pushNotifications: false,
        theme: (data.theme as 'light' | 'dark' | 'system') || 'system',
      };

      return mappedSettings;
    },
    enabled: !!user?.id,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Map frontend structure to database fields
      const dbSettings = {
        user_id: user.id,
        theme: newSettings.theme,
        notification_task_due_soon: newSettings.notifications.taskDueSoon,
        notification_task_overdue: newSettings.notifications.taskOverdue,
        notification_task_upcoming: newSettings.notifications.taskUpcoming,
        notification_warranty_expiring: newSettings.notifications.warrantyExpiring,
        notification_task_completed: newSettings.notifications.taskCompleted,
        notification_task_created: newSettings.notifications.taskCreated,
      };

      const { error } = await supabase
        .from('user_settings')
        .upsert(dbSettings, { 
          onConflict: 'user_id'
        });

      if (error) throw error;
      return newSettings;
    },
    onSuccess: (newSettings) => {
      applyTheme(newSettings.theme);
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
  });

  useEffect(() => {
    applyTheme(settings.theme);

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
    try {
      await updateSettingsMutation.mutateAsync(newSettings);
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: 'Failed to save settings' };
    }
  };

  return {
    settings,
    updateSettings,
    isLoading: isLoading || updateSettingsMutation.isPending,
  };
};
