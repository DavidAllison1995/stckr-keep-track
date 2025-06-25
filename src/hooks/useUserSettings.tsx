
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export interface UserSettings {
  notifications: {
    taskDueSoon: boolean;
    taskOverdue: boolean;
    taskDueToday: boolean;
    warrantyExpiring: boolean;
    taskCompleted: boolean;
    taskCreated: boolean;
    taskUpdated: boolean;
    recurringTaskReminder: boolean;
  };
  showCompletedTasks: boolean;
}

const defaultSettings: UserSettings = {
  notifications: {
    taskDueSoon: true,
    taskOverdue: true,
    taskDueToday: true,
    warrantyExpiring: true,
    taskCompleted: false,
    taskCreated: false,
    taskUpdated: true,
    recurringTaskReminder: true,
  },
  showCompletedTasks: false,
};

export const useUserSettings = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: settings = defaultSettings, isLoading } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: async () => {
      if (!user?.id) return defaultSettings;

      console.log('Fetching user settings for user:', user.id);

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return defaultSettings;
      }

      if (!data) {
        console.log('No user settings found, returning defaults');
        return defaultSettings;
      }

      console.log('Loaded user settings from database:', data);

      // Map database fields to frontend structure
      const mappedSettings: UserSettings = {
        notifications: {
          taskDueSoon: data.notification_task_due_soon ?? true,
          taskOverdue: data.notification_task_overdue ?? true,
          taskDueToday: data.notification_task_due_today ?? true,
          warrantyExpiring: data.notification_warranty_expiring ?? true,
          taskCompleted: data.notification_task_completed ?? false,
          taskCreated: data.notification_task_created ?? false,
          taskUpdated: data.notification_task_updated ?? true,
          recurringTaskReminder: data.notification_recurring_task_reminder ?? true,
        },
        showCompletedTasks: false, // Default value since not stored in DB yet
      };

      console.log('Mapped settings:', mappedSettings);
      return mappedSettings;
    },
    enabled: !!user?.id,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Updating settings for user:', user.id, newSettings);

      // Map frontend structure to database fields
      const dbSettings = {
        user_id: user.id,
        notification_task_due_soon: newSettings.notifications.taskDueSoon,
        notification_task_overdue: newSettings.notifications.taskOverdue,
        notification_task_due_today: newSettings.notifications.taskDueToday,
        notification_warranty_expiring: newSettings.notifications.warrantyExpiring,
        notification_task_completed: newSettings.notifications.taskCompleted,
        notification_task_created: newSettings.notifications.taskCreated,
        notification_task_updated: newSettings.notifications.taskUpdated,
        notification_recurring_task_reminder: newSettings.notifications.recurringTaskReminder,
      };

      console.log('Database settings to save:', dbSettings);

      const { error } = await supabase
        .from('user_settings')
        .upsert(dbSettings, { 
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving user settings:', error);
        throw error;
      }

      console.log('Settings saved successfully');
      return newSettings;
    },
    onSuccess: (newSettings) => {
      console.log('Settings mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    },
    onError: (error) => {
      console.error('Settings mutation failed:', error);
    },
  });

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
