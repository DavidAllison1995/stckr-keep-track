
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useNotificationTriggers } from './useNotificationTriggers';

export interface MaintenanceTask {
  id: string;
  user_id: string;
  item_id?: string;
  title: string;
  notes?: string;
  date: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_rule?: string;
  parent_task_id?: string;
  status: 'pending' | 'due_soon' | 'overdue' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export const useSupabaseMaintenance = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const { triggerTaskCreatedNotification, triggerTaskCompletedNotification } = useNotificationTriggers();

  // Fetch tasks
  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['maintenance_tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching maintenance tasks for user:', user.id);
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching maintenance tasks:', error);
        throw error;
      }
      
      console.log('Fetched maintenance tasks:', data?.length || 0);
      return data as MaintenanceTask[];
    },
    enabled: !!user?.id,
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('=== CREATING NEW TASK ===');
      console.log('Task data:', taskData);

      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert([{
          ...taskData,
          user_id: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating maintenance task:', error);
        throw error;
      }

      console.log('✅ Task created successfully:', data);
      return data as MaintenanceTask;
    },
    onSuccess: async (newTask) => {
      console.log('=== TASK CREATION SUCCESS ===');
      console.log('New task created:', newTask);
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['maintenance_tasks', user?.id] });
      
      try {
        // 🔍 FIXED: Check user preferences before triggering task created notification
        console.log('🔔 About to trigger task created notification...');
        console.log('Task details for notification:', { id: newTask.id, title: newTask.title, itemId: newTask.item_id });
        
        await triggerTaskCreatedNotification(newTask.id, newTask.title, newTask.item_id);
        
        console.log('🔔 Task created notification trigger completed successfully');
      } catch (notificationError) {
        console.error('❌ Failed to create task created notification:', notificationError);
      }
    },
    onError: (error) => {
      console.error('Error adding maintenance task:', error);
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaintenanceTask> }) => {
      console.log('=== UPDATING TASK ===');
      console.log('Task ID:', id, 'Updates:', updates);
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating maintenance task:', error);
        throw error;
      }

      console.log('✅ Task updated successfully:', data);
      return { originalId: id, updatedTask: data as MaintenanceTask };
    },
    onSuccess: async ({ originalId, updatedTask }) => {
      console.log('=== TASK UPDATE SUCCESS ===');
      console.log('Updated task:', updatedTask);
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['maintenance_tasks', user?.id] });
      
      // 🔍 FIXED: Check if task was just completed and trigger notification
      const originalTask = tasks.find(t => t.id === originalId);
      const wasJustCompleted = originalTask && originalTask.status !== 'completed' && updatedTask.status === 'completed';
      
      if (wasJustCompleted) {
        try {
          console.log('🔔 Task was just completed - triggering notification...');
          console.log('Completed task details:', { id: updatedTask.id, title: updatedTask.title, itemId: updatedTask.item_id });
          
          await triggerTaskCompletedNotification(updatedTask.id, updatedTask.title, updatedTask.item_id);
          
          console.log('🔔 Task completed notification triggered successfully');
        } catch (notificationError) {
          console.error('❌ Failed to create task completed notification:', notificationError);
        }
      }
    },
    onError: (error) => {
      console.error('Error updating maintenance task:', error);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting maintenance task:', id);
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting maintenance task:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_tasks', user?.id] });
    },
    onError: (error) => {
      console.error('Error deleting maintenance task:', error);
    },
  });

  // Convenience functions
  const addTask = (taskData: Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => {
    addTaskMutation.mutate(taskData);
  };

  const updateTask = (id: string, updates: Partial<MaintenanceTask>) => {
    updateTaskMutation.mutate({ id, updates });
  };

  const deleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
  };

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    isAddingTask: addTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
};
