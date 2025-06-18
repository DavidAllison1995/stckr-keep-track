
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface MaintenanceTask {
  id: string;
  itemId?: string;
  title: string;
  notes?: string;
  date: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'up_to_date' | 'due_soon' | 'overdue' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceContextType {
  tasks: MaintenanceTask[];
  addTask: (task: Omit<MaintenanceTask, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => void;
  deleteTask: (id: string) => void;
  markTaskComplete: (id: string) => void;
  getTasksByStatus: (status: MaintenanceTask['status']) => MaintenanceTask[];
  getTasksByItem: (itemId: string, includeCompleted?: boolean) => MaintenanceTask[];
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);

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

  const addTask = (taskData: Omit<MaintenanceTask, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const status = calculateTaskStatus(taskData.date);
    const newTask: MaintenanceTask = {
      ...taskData,
      id: Date.now().toString(),
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<MaintenanceTask>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
        if (updates.date && updates.status !== 'completed') {
          updatedTask.status = calculateTaskStatus(updates.date);
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const markTaskComplete = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        return { ...task, status: 'completed', updatedAt: new Date().toISOString() };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getTasksByStatus = (status: MaintenanceTask['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByItem = (itemId: string, includeCompleted: boolean = false) => {
    return tasks.filter(task => {
      if (task.itemId !== itemId) return false;
      if (!includeCompleted && task.status === 'completed') return false;
      return true;
    });
  };

  // Update task statuses periodically (but don't override completed status)
  useEffect(() => {
    const updateStatuses = () => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'completed') return task;
        return {
          ...task,
          status: calculateTaskStatus(task.date)
        };
      }));
    };

    // Update statuses on mount and every hour
    updateStatuses();
    const interval = setInterval(updateStatuses, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MaintenanceContext.Provider value={{ 
      tasks, 
      addTask, 
      updateTask, 
      deleteTask, 
      markTaskComplete,
      getTasksByStatus, 
      getTasksByItem 
    }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
