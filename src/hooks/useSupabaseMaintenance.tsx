
import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';

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
  status: 'up_to_date' | 'due_soon' | 'overdue' | 'completed';
  created_at: string;
  updated_at: string;
}

interface MaintenanceContextType {
  tasks: MaintenanceTask[];
  isLoading: boolean;
  addTask: (task: Omit<MaintenanceTask, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<void>;
  deleteTask: (id: string, scope?: 'single' | 'all') => Promise<void>;
  markTaskComplete: (id: string) => Promise<void>;
  getTasksByStatus: (status: MaintenanceTask['status']) => MaintenanceTask[];
  getTasksByItem: (itemId: string, includeCompleted?: boolean) => MaintenanceTask[];
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const calculateTaskStatus = (dueDate: string): MaintenanceTask['status'] => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return 'overdue';
    } else if (diffInDays <= 14) {
      return 'due_soon';
    } else {
      return 'up_to_date';
    }
  };

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
        throw error;
      }

      // Calculate current status for each task
      return (data || []).map(task => ({
        ...task,
        status: task.status === 'completed' ? 'completed' : calculateTaskStatus(task.date)
      }));
    },
    enabled: !!user,
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<MaintenanceTask, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const status = calculateTaskStatus(taskData.date);
      const recurrence_rule = taskData.recurrence !== 'none' ? `FREQ=${taskData.recurrence.toUpperCase()};INTERVAL=1` : undefined;

      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert([{
          ...taskData,
          user_id: user.id,
          status,
          recurrence_rule,
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
      console.error('Error adding task:', error);
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
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update maintenance task',
        variant: 'destructive',
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async ({ id, scope }: { id: string; scope: 'single' | 'all' }) => {
      if (scope === 'all') {
        // Find the parent task and delete all related tasks
        const task = tasks.find(t => t.id === id);
        const parentId = task?.parent_task_id || id;
        
        const { error } = await supabase
          .from('maintenance_tasks')
          .delete()
          .or(`id.eq.${parentId},parent_task_id.eq.${parentId}`);

        if (error) throw error;
      } else {
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
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete maintenance task',
        variant: 'destructive',
      });
    },
  });

  const addTask = async (taskData: Omit<MaintenanceTask, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    await addTaskMutation.mutateAsync(taskData);
  };

  const updateTask = async (id: string, updates: Partial<MaintenanceTask>) => {
    await updateTaskMutation.mutateAsync({ id, updates });
  };

  const deleteTask = async (id: string, scope: 'single' | 'all' = 'single') => {
    await deleteTaskMutation.mutateAsync({ id, scope });
  };

  const markTaskComplete = async (id: string) => {
    await updateTaskMutation.mutateAsync({ 
      id, 
      updates: { status: 'completed' }
    });
  };

  const getTasksByStatus = (status: MaintenanceTask['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByItem = (itemId: string, includeCompleted: boolean = false) => {
    return tasks.filter(task => {
      if (task.item_id !== itemId) return false;
      if (!includeCompleted && task.status === 'completed') return false;
      return true;
    });
  };

  return (
    <MaintenanceContext.Provider value={{
      tasks,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      markTaskComplete,
      getTasksByStatus,
      getTasksByItem,
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
