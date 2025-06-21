
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useNotificationTriggers = () => {
  const { user } = useSupabaseAuth();

  const triggerTaskCreatedNotification = async (taskId: string, taskTitle: string, itemId?: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'task_created',
          title: `New Task Created: ${taskTitle}`,
          message: 'A new maintenance task has been added',
          task_id: taskId,
          item_id: itemId
        });
    } catch (error) {
      console.error('Error creating task notification:', error);
    }
  };

  const triggerTaskCompletedNotification = async (taskId: string, taskTitle: string, itemId?: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'task_completed',
          title: `Task Completed: ${taskTitle}`,
          message: 'A maintenance task has been completed',
          task_id: taskId,
          item_id: itemId
        });
    } catch (error) {
      console.error('Error creating completion notification:', error);
    }
  };

  const generateNotificationsManually = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating notifications:', error);
      throw error;
    }
  };

  return {
    triggerTaskCreatedNotification,
    triggerTaskCompletedNotification,
    generateNotificationsManually,
  };
};
