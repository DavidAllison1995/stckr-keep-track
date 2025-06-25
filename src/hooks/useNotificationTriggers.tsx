
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useUserSettings } from './useUserSettings';

export const useNotificationTriggers = () => {
  const { user } = useSupabaseAuth();
  const { settings } = useUserSettings();

  const triggerTaskCreatedNotification = async (taskId: string, taskTitle: string, taskDate: string, itemId?: string) => {
    if (!user?.id || !settings.notifications.taskCreated) {
      console.log('Task created notification skipped - user not found or disabled');
      return;
    }

    try {
      console.log('Creating task created notification:', { taskId, taskTitle, taskDate, itemId, userId: user.id });
      const formattedDate = new Date(taskDate).toLocaleDateString();
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'task_created',
          title: `New Task Created: ${taskTitle}`,
          message: `New task '${taskTitle}' has been added for ${formattedDate}.`,
          task_id: taskId,
          item_id: itemId
        })
        .select();

      if (error) {
        console.error('Supabase error creating task notification:', error);
        throw error;
      }
      
      console.log('Task created notification created successfully:', data);
    } catch (error) {
      console.error('Error creating task notification:', error);
    }
  };

  const triggerTaskCompletedNotification = async (taskId: string, taskTitle: string, itemId?: string) => {
    if (!user?.id || !settings.notifications.taskCompleted) {
      console.log('Task completed notification skipped - user not found or disabled');
      return;
    }

    try {
      console.log('Creating task completed notification:', { taskId, taskTitle, itemId, userId: user.id });
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'task_completed',
          title: `Task Completed: ${taskTitle}`,
          message: `Task '${taskTitle}' has been marked as completed.`,
          task_id: taskId,
          item_id: itemId
        })
        .select();

      if (error) {
        console.error('Supabase error creating completion notification:', error);
        throw error;
      }
      
      console.log('Task completed notification created successfully:', data);
    } catch (error) {
      console.error('Error creating completion notification:', error);
    }
  };

  const triggerTaskUpdatedNotification = async (taskId: string, taskTitle: string, newDueDate: string, itemId?: string) => {
    if (!user?.id || !settings.notifications.taskUpdated) {
      console.log('Task updated notification skipped - user not found or disabled');
      return;
    }

    try {
      console.log('Creating task updated notification:', { taskId, taskTitle, newDueDate, itemId, userId: user.id });
      const formattedDate = new Date(newDueDate).toLocaleDateString();
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'task_updated',
          title: `Task Updated: ${taskTitle}`,
          message: `'${taskTitle}' was updated. New due date: ${formattedDate}.`,
          task_id: taskId,
          item_id: itemId
        })
        .select();

      if (error) {
        console.error('Supabase error creating task updated notification:', error);
        throw error;
      }
      
      console.log('Task updated notification created successfully:', data);
    } catch (error) {
      console.error('Error creating task updated notification:', error);
    }
  };

  const triggerItemCreatedNotification = async (itemId: string, itemName: string) => {
    if (!user?.id) {
      console.error('No user ID available for item created notification');
      return;
    }

    try {
      console.log('Creating item notification for:', { itemId, itemName, userId: user.id });
      
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'item_created',
          title: `New Item Added: ${itemName}`,
          message: 'A new item has been added to your inventory',
          item_id: itemId
        })
        .select();

      if (error) {
        console.error('Supabase error creating item notification:', error);
        throw error;
      }
      
      console.log('Item created notification created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating item notification:', error);
      throw error;
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
    triggerTaskUpdatedNotification,
    triggerItemCreatedNotification,
    generateNotificationsManually,
  };
};
