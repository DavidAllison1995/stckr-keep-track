
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

export const useNotificationTriggers = () => {
  const { user } = useSupabaseAuth();

  // Helper function to check user notification preferences
  const getUserNotificationPreferences = async (userId: string) => {
    console.log('Fetching notification preferences for user:', userId);
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('notification_task_due_soon, notification_task_overdue, notification_warranty_expiring, notification_task_completed, notification_task_created')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user preferences:', error);
      return null;
    }

    const preferences = data || {
      notification_task_due_soon: true,
      notification_task_overdue: true,
      notification_warranty_expiring: true,
      notification_task_completed: false,
      notification_task_created: false,
    };

    console.log('User notification preferences:', preferences);
    return preferences;
  };

  const triggerTaskCreatedNotification = async (taskId: string, taskTitle: string, itemId?: string) => {
    if (!user?.id) {
      console.error('No user ID available for task created notification');
      return;
    }

    try {
      console.log('🔍 Checking task created notification preferences...');
      
      // 🔍 FIXED: Check user preferences before creating notification
      const preferences = await getUserNotificationPreferences(user.id);
      if (!preferences?.notification_task_created) {
        console.log('🔕 Task created notifications disabled for user, skipping');
        return;
      }

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
      
      console.log('✅ Task created notification created successfully:', data);
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
      console.log('🔍 Checking task completed notification preferences...');
      
      // 🔍 FIXED: Check user preferences before creating notification
      const preferences = await getUserNotificationPreferences(user.id);
      if (!preferences?.notification_task_completed) {
        console.log('🔕 Task completed notifications disabled for user, skipping');
        return;
      }

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
      
      console.log('✅ Task completed notification created successfully:', data);
    } catch (error) {
      console.error('Error creating completion notification:', error);
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
      
      console.log('✅ Item created notification created successfully:', data);
    } catch (error) {
      console.error('Error creating item notification:', error);
      throw error;
    }
  };

  const generateNotificationsManually = async () => {
    try {
      console.log('🔍 Manually generating notifications...');
      
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

      const result = await response.json();
      console.log('✅ Manual notification generation completed:', result);
      return result;
    } catch (error) {
      console.error('Error generating notifications:', error);
      throw error;
    }
  };

  // 🧪 TESTING: Development notification test functions
  const testNotificationTriggers = async () => {
    if (!user?.id) {
      console.error('No user for testing notifications');
      return;
    }

    console.log('🧪 TESTING ALL NOTIFICATION TRIGGERS');

    try {
      // Test task created
      await triggerTaskCreatedNotification('test-task-id', 'Test Task Created', 'test-item-id');
      
      // Test task completed
      await triggerTaskCompletedNotification('test-task-id', 'Test Task Completed', 'test-item-id');
      
      // Test item created
      await triggerItemCreatedNotification('test-item-id', 'Test Item Created');
      
      // Test manual generation
      await generateNotificationsManually();
      
      console.log('✅ All notification test triggers completed');
    } catch (error) {
      console.error('❌ Error during notification testing:', error);
    }
  };

  return {
    triggerTaskCreatedNotification,
    triggerTaskCompletedNotification,
    triggerItemCreatedNotification,
    generateNotificationsManually,
    testNotificationTriggers, // For development testing
  };
};
