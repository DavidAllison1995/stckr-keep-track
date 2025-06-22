
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useNotificationTriggers = () => {
  const { user } = useSupabaseAuth();

  const triggerTaskCreatedNotification = async (taskId: string, taskTitle: string, itemId?: string) => {
    if (!user?.id) {
      console.error('No user ID available for task created notification');
      return;
    }

    try {
      console.log('Creating task created notification:', { taskId, taskTitle, itemId, userId: user.id });
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'task_created',
          title: `New Task Created: ${taskTitle}`,
          message: 'A new maintenance task has been added',
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
    if (!user?.id) {
      console.error('No user ID available for task completed notification');
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
          message: 'A maintenance task has been completed',
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

  const triggerItemCreatedNotification = async (itemId: string, itemName: string) => {
    console.log('=== STARTING ITEM NOTIFICATION CREATION ===');
    console.log('User object:', user);
    console.log('User ID:', user?.id);
    console.log('Item ID:', itemId);
    console.log('Item Name:', itemName);

    if (!user?.id) {
      console.error('❌ No user ID available for item created notification');
      console.error('User object:', user);
      return;
    }

    try {
      console.log('✅ About to insert notification into database...');
      
      const notificationData = {
        user_id: user.id,
        type: 'item_created',
        title: `New Item Added: ${itemName}`,
        message: 'A new item has been added to your inventory',
        item_id: itemId
      };
      
      console.log('Notification data to insert:', notificationData);
      
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select();

      if (error) {
        console.error('❌ Supabase error creating item notification:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('✅ Item created notification inserted successfully:', data);
      console.log('=== NOTIFICATION CREATION COMPLETE ===');
      return data;
    } catch (error) {
      console.error('❌ Error creating item notification:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
    triggerItemCreatedNotification,
    generateNotificationsManually,
  };
};
