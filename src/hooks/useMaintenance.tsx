
import { createContext, useContext, useState, ReactNode } from 'react';

export interface MaintenanceTask {
  id: string;
  itemId: string;
  title: string;
  notes?: string;
  date: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'up_to_date' | 'due_soon' | 'overdue';
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceContextType {
  tasks: MaintenanceTask[];
  addTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => void;
  deleteTask: (id: string) => void;
  getTasksByStatus: (status: MaintenanceTask['status']) => MaintenanceTask[];
  getTasksByItem: (itemId: string) => MaintenanceTask[];
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);

  const addTask = (taskData: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: MaintenanceTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<MaintenanceTask>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getTasksByStatus = (status: MaintenanceTask['status']) => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByItem = (itemId: string) => {
    return tasks.filter(task => task.itemId === itemId);
  };

  return (
    <MaintenanceContext.Provider value={{ 
      tasks, 
      addTask, 
      updateTask, 
      deleteTask, 
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
