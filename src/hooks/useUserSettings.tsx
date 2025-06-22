
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { UserSettings } from '@/types/settings';

export const useUserSettings = () => {
  const { user } = useSupabaseAuth();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      taskDueSoon: true,
      taskOverdue: true,
      warrantyExpiring: true,
      taskCompleted: true, // ✅ Default to true
      taskCreated: false,
    },
    showCompletedTasks: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        console.log('Fetching user settings for:', user.id);
        
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user settings:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          console.log('Found user settings:', data);
          setSettings({
            notifications: {
              taskDueSoon: data.notification_task_due_soon ?? true,
              taskOverdue: data.notification_task_overdue ?? true,
              warrantyExpiring: data.notification_warranty_expiring ?? true,
              taskCompleted: data.notification_task_completed ?? true, // ✅ Default to true
              taskCreated: data.notification_task_created ?? false,
            },
            showCompletedTasks: false, // This field doesn't exist in DB yet
          });
        } else {
          console.log('No user settings found, creating default settings...');
          // ✅ Create default settings if none exist
          await createDefaultSettings();
        }
      } catch (error) {
        console.error('Error in fetchSettings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const createDefaultSettings = async () => {
      try {
        const defaultSettings = {
          user_id: user.id,
          notification_task_due_soon: true,
          notification_task_overdue: true,
          notification_warranty_expiring: true,
          notification_task_completed: true, // ✅ Default to true
          notification_task_created: false,
        };

        const { error } = await supabase
          .from('user_settings')
          .insert(defaultSettings);

        if (error) {
          console.error('Error creating default settings:', error);
        } else {
          console.log('✅ Default settings created successfully');
          setSettings({
            notifications: {
              taskDueSoon: true,
              taskOverdue: true,
              warrantyExpiring: true,
              taskCompleted: true, // ✅ Default to true
              taskCreated: false,
            },
            showCompletedTasks: false,
          });
        }
      } catch (error) {
        console.error('Error creating default settings:', error);
      }
    };

    fetchSettings();
  }, [user?.id]);

  const updateSettings = async (newSettings: UserSettings): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      console.log('Updating user settings:', newSettings);
      
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          notification_task_due_soon: newSettings.notifications.taskDueSoon,
          notification_task_overdue: newSettings.notifications.taskOverdue,
          notification_warranty_expiring: newSettings.notifications.warrantyExpiring,
          notification_task_completed: newSettings.notifications.taskCompleted,
          notification_task_created: newSettings.notifications.taskCreated,
        });

      if (error) {
        console.error('Error updating user settings:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ User settings updated successfully');
      setSettings(newSettings);
      return { success: true };
    } catch (error) {
      console.error('Error in updateSettings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  };

  return {
    settings,
    updateSettings,
    isLoading,
  };
};
