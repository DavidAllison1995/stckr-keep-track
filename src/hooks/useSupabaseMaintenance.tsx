
import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export type MaintenanceTaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'due_soon';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface MaintenanceTask {
  id: string;
  user_id: string;
  item_id: string | null;
  title: string;
  notes: string | null;
  date: string;
  status: MaintenanceTaskStatus;
  recurrence: RecurrenceType;
  recurrence_rule: string | null;
  parent_task_id: string | null;
  created_at: string;
  updated_at: string;
  virtual?: boolean; // For calendar virtual tasks
}

interface MaintenanceContextType {
  tasks: MaintenanceTask[];
  isLoading: boolean;
  addTask: (task: Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<void>;
  deleteTask: (id: string, scope?: 'single' | 'all') => Promise<void>;
  markTaskComplete: (id: string) => Promise<void>;
  getTaskById: (id: string) => MaintenanceTask | undefined;
  getTasksByItem: (itemId: string, includeCompleted?: boolean) => MaintenanceTask[];
  getTasksByStatus: (status: MaintenanceTaskStatus) => MaintenanceTask[];
  getUpcomingTasks: (days?: number) => MaintenanceTask[];
  getOverdueTasks: () => MaintenanceTask[];
  generateVirtualTasks: (rangeStart: Date, rangeEnd: Date) => MaintenanceTask[];
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

const calculateNextDate = (currentDate: string, recurrence: RecurrenceType): string => {
  const date = new Date(currentDate);
  
  switch (recurrence) {
    case 'daily':
      return addDays(date, 1).toISOString().split('T')[0];
    case 'weekly':
      return addWeeks(date, 1).toISOString().split('T')[0];
    case 'monthly':
      return addMonths(date, 1).toISOString().split('T')[0];
    case 'yearly':
      return addYears(date, 1).toISOString().split('T')[0];
    default:
      return currentDate;
  }
};

const calculateTaskStatus = (dueDate: string): MaintenanceTaskStatus => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) {
    return 'overdue';
  } else if (diffInDays <= 7) {
    return 'due_soon';
  } else {
    return 'pending';
  }
};

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

      return (data || []).map(task => ({
        ...task,
        status: task.status as MaintenanceTaskStatus,
        recurrence: task.recurrence as RecurrenceType,
      }));
    },
    enabled: !!user,
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert([{
          ...taskData,
          user_id: user.id,
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
    mutationFn: async ({ id, scope }: { id: string; scope?: 'single' | 'all' }) => {
      if (scope === 'all') {
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
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update({ status: 'completed' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If it's a recurring task, create the next occurrence
      if (task.recurrence !== 'none') {
        const nextDate = calculateNextDate(task.date, task.recurrence);
        const nextStatus = calculateTaskStatus(nextDate);
        
        const { error: insertError } = await supabase
          .from('maintenance_tasks')
          .insert([{
            user_id: task.user_id,
            item_id: task.item_id,
            title: task.title,
            notes: task.notes,
            date: nextDate,
            status: nextStatus,
            recurrence: task.recurrence,
            recurrence_rule: task.recurrence_rule,
            parent_task_id: task.parent_task_id || task.id,
          }]);

        if (insertError) {
          console.error('Error creating next recurring task:', insertError);
          toast({
            title: 'Warning',
            description: 'Task completed but failed to create next occurrence',
            variant: 'destructive',
          });
        }
      }

      return data;
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

  const generateVirtualTasks = (rangeStart: Date, rangeEnd: Date): MaintenanceTask[] => {
    const virtualTasks: MaintenanceTask[] = [];
    
    // Get all recurring tasks that are not completed
    const recurringTasks = tasks.filter(task => 
      task.recurrence !== 'none' && 
      task.status !== 'completed'
    );

    recurringTasks.forEach(task => {
      const taskDate = new Date(task.date);
      let currentDate = new Date(taskDate);
      
      // Generate virtual occurrences within the range
      while (currentDate <= rangeEnd) {
        if (currentDate >= rangeStart && currentDate.getTime() !== taskDate.getTime()) {
          virtualTasks.push({
            ...task,
            id: `${task.id}-virtual-${currentDate.toISOString().split('T')[0]}`,
            date: currentDate.toISOString().split('T')[0],
            status: calculateTaskStatus(currentDate.toISOString().split('T')[0]),
            virtual: true,
          });
        }
        
        // Calculate next occurrence
        const nextDateStr = calculateNextDate(currentDate.toISOString().split('T')[0], task.recurrence);
        currentDate = new Date(nextDateStr);
      }
    });

    return virtualTasks;
  };

  const addTask = async (taskData: Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addTaskMutation.mutateAsync(taskData);
  };

  const updateTask = async (id: string, updates: Partial<MaintenanceTask>) => {
    await updateTaskMutation.mutateAsync({ id, updates });
  };

  const deleteTask = async (id: string, scope: 'single' | 'all' = 'single') => {
    await deleteTaskMutation.mutateAsync({ id, scope });
  };

  const markTaskComplete = async (id: string) => {
    await markTaskCompleteMutation.mutateAsync(id);
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const getTasksByItem = (itemId: string, includeCompleted = false) => {
    // Only show the most recent active task for each recurring series
    const itemTasks = tasks.filter(task => 
      task.item_id === itemId && 
      (includeCompleted || task.status !== 'completed')
    );

    // Group by parent_task_id or id for recurring tasks
    const taskGroups = new Map<string, MaintenanceTask[]>();
    
    itemTasks.forEach(task => {
      const groupKey = task.parent_task_id || task.id;
      if (!taskGroups.has(groupKey)) {
        taskGroups.set(groupKey, []);
      }
      taskGroups.get(groupKey)!.push(task);
    });

    // Return only the most recent task from each group
    const result: MaintenanceTask[] = [];
    taskGroups.forEach(group => {
      const sortedGroup = group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const mostRecent = sortedGroup.find(task => task.status !== 'completed') || sortedGroup[0];
      if (mostRecent) {
        result.push(mostRecent);
      }
    });

    return result;
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
    const now = new Date();
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate < now && task.status !== 'completed';
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
      getTaskById,
      getTasksByItem,
      getTasksByStatus,
      getUpcomingTasks,
      getOverdueTasks,
      generateVirtualTasks,
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
