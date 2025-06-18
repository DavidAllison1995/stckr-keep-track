
import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

export type MaintenanceTaskStatus = 'up_to_date' | 'due_soon' | 'overdue' | 'completed';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface MaintenanceTask {
  id: string;
  user_id: string;
  item_id?: string;
  title: string;
  date: string;
  notes?: string;
  recurrence: RecurrenceType;
  recurrence_rule?: string;
  status: MaintenanceTaskStatus;
  parent_task_id?: string;
  created_at: string;
  updated_at: string;
}

interface MaintenanceContextType {
  tasks: MaintenanceTask[];
  isLoading: boolean;
  addTask: (task: Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<void>;
  deleteTask: (id: string, deleteType: 'single' | 'all') => Promise<void>;
  markTaskComplete: (id: string) => Promise<void>;
  getTasksByItem: (itemId: string, includeCompleted?: boolean) => MaintenanceTask[];
  getTasksByStatus: (status: MaintenanceTaskStatus) => MaintenanceTask[];
  getUpcomingTasks: (days?: number) => MaintenanceTask[];
  getOverdueTasks: () => MaintenanceTask[];
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['maintenance-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching maintenance tasks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load maintenance tasks',
          variant: 'destructive',
        });
        throw error;
      }

      // Calculate status for each task
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

      return (data || []).map(task => {
        if (task.status === 'completed') {
          return { ...task, recurrence: task.recurrence as RecurrenceType };
        }

        const taskDate = new Date(task.date);
        const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        
        let status: MaintenanceTaskStatus = 'up_to_date';
        if (taskDateOnly < today) {
          status = 'overdue';
        } else if (taskDateOnly <= threeDaysFromNow) {
          status = 'due_soon';
        }

        return { 
          ...task, 
          status,
          recurrence: task.recurrence as RecurrenceType 
        };
      });
    },
    enabled: !!user,
  });

  const getTasksByItem = (itemId: string, includeCompleted = false) => {
    return tasks.filter(task => 
      task.item_id === itemId && 
      (includeCompleted || task.status !== 'completed')
    );
  };

  const getTasksByStatus = (status: MaintenanceTaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getUpcomingTasks = (days = 7) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= now && taskDate <= futureDate && task.status !== 'completed';
    });
  };

  const getOverdueTasks = () => {
    return tasks.filter(task => task.status === 'overdue');
  };

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert([{
          ...taskData,
          user_id: user.id,
          status: 'up_to_date'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks', user?.id] });
      toast({
        title: 'Success',
        description: 'Maintenance task added successfully',
      });
    },
    onError: (error) => {
      console.error('Error adding maintenance task:', error);
      toast({
        title: 'Error',
        description: 'Failed to add maintenance task',
        variant: 'destructive',
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaintenanceTask> }) => {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating maintenance task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update maintenance task',
        variant: 'destructive',
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async ({ id, deleteType }: { id: string; deleteType: 'single' | 'all' }) => {
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');

      if (deleteType === 'all' && (task.recurrence !== 'none' || task.parent_task_id)) {
        // Delete all tasks in the series
        const parentId = task.parent_task_id || task.id;
        const { error } = await supabase
          .from('maintenance_tasks')
          .delete()
          .or(`id.eq.${parentId},parent_task_id.eq.${parentId}`);

        if (error) throw error;
      } else {
        // Delete single task
        const { error } = await supabase
          .from('maintenance_tasks')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks', user?.id] });
      toast({
        title: 'Success',
        description: 'Maintenance task deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting maintenance task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete maintenance task',
        variant: 'destructive',
      });
    },
  });

  const markTaskCompleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const task = tasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');

      // Mark current task as completed
      const { error: updateError } = await supabase
        .from('maintenance_tasks')
        .update({ status: 'completed' })
        .eq('id', id);

      if (updateError) throw updateError;

      // If task has recurrence, create next occurrence
      if (task.recurrence !== 'none') {
        const nextDate = calculateNextDate(new Date(task.date), task.recurrence);
        
        const { error: insertError } = await supabase
          .from('maintenance_tasks')
          .insert([{
            user_id: task.user_id,
            item_id: task.item_id,
            title: task.title,
            date: nextDate.toISOString().split('T')[0],
            notes: task.notes,
            recurrence: task.recurrence,
            recurrence_rule: task.recurrence_rule,
            parent_task_id: task.parent_task_id || task.id,
            status: 'up_to_date'
          }]);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tasks', user?.id] });
      toast({
        title: 'Success',
        description: 'Task marked as complete',
      });
    },
    onError: (error) => {
      console.error('Error marking task complete:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark task as complete',
        variant: 'destructive',
      });
    },
  });

  const calculateNextDate = (currentDate: Date, recurrence: RecurrenceType): Date => {
    const nextDate = new Date(currentDate);
    
    switch (recurrence) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
    
    return nextDate;
  };

  const addTask = async (taskData: Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => {
    await addTaskMutation.mutateAsync(taskData);
  };

  const updateTask = async (id: string, updates: Partial<MaintenanceTask>) => {
    await updateTaskMutation.mutateAsync({ id, updates });
  };

  const deleteTask = async (id: string, deleteType: 'single' | 'all') => {
    await deleteTaskMutation.mutateAsync({ id, deleteType });
  };

  const markTaskComplete = async (id: string) => {
    await markTaskCompleteMutation.mutateAsync(id);
  };

  return (
    <MaintenanceContext.Provider value={{
      tasks,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      markTaskComplete,
      getTasksByItem,
      getTasksByStatus,
      getUpcomingTasks,
      getOverdueTasks,
    }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useSupabaseMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useSupabaseMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
