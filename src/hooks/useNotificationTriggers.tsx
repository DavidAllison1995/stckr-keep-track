
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useNotificationTriggers = () => {
  const { user } = useSupabaseAuth();

  const triggerTaskCreatedNotification = async (taskId: string, taskTitle: string, itemId?: string) => {
    if (!user?.id) return;

    try {
      console.log('Creating task created notification:', { taskId, taskTitle, itemId });
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
      console.log('Task created notification created successfully');
    } catch (error) {
      console.error('Error creating task notification:', error);
    }
  };

  const triggerTaskCompletedNotification = async (taskId: string, taskTitle: string, itemId?: string) => {
    if (!user?.id) return;

    try {
      console.log('Creating task completed notification:', { taskId, taskTitle, itemId });
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
      console.log('Task completed notification created successfully');
    } catch (error) {
      console.error('Error creating completion notification:', error);
    }
  };

  const triggerItemCreatedNotification = async (itemId: string, itemName: string) => {
    if (!user?.id) return;

    try {
      console.log('Creating item created notification:', { itemId, itemName, userId: user.id });
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'item_created',
          title: `New Item Added: ${itemName}`,
          message: 'A new item has been added to your inventory',
          item_id: itemId
        });
      console.log('Item created notification created successfully');
    } catch (error) {
      console.error('Error creating item notification:', error);
    }
  };

  const generateNotificationsManually = async () => {
    try {
      const response = await fetch(`https://cudftlquaydissmvqjmv.supabase.co/functions/v1/generate-notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZGZ0bHF1YXlkaXNzbXZxam12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzkwNTksImV4cCI6MjA2NTg1NTA1OX0.f6_TmpyKF6VtQJL65deTrEdNnag6sSQw-eYWYUtQgaQ`,
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
    triggerItemCreatedNotification,
    generateNotificationsManually,
  };
};
