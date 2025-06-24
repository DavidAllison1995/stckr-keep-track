
import { startOfDay, addDays } from 'date-fns';

export type TaskStatus = 'up_to_date' | 'due_soon' | 'overdue' | 'completed';

export interface TaskWithStatus {
  date: string;
  status?: string;
}

/**
 * Calculates the status of a task based on its due date
 * - Up to Date: Due date is more than 14 days from today
 * - Due Soon: Due date is between today and 14 days from today (inclusive)
 * - Overdue: Due date is strictly before today
 * 
 * A task due today is considered "Due Soon" until midnight
 */
export const calculateTaskStatus = (taskDate: string): TaskStatus => {
  const today = startOfDay(new Date());
  const due = startOfDay(new Date(taskDate));
  const fourteenDaysFromToday = addDays(today, 14);
  
  if (due < today) {
    return 'overdue';
  } else if (due >= today && due <= fourteenDaysFromToday) {
    return 'due_soon';
  } else {
    return 'up_to_date';
  }
};

/**
 * Gets the display-friendly status label
 */
export const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case 'overdue':
      return 'Overdue';
    case 'due_soon':
      return 'Due Soon';
    case 'up_to_date':
      return 'Up to Date';
    case 'completed':
      return 'Completed';
    default:
      return 'Unknown';
  }
};

/**
 * Gets the appropriate CSS classes for task status styling
 */
export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'due_soon':
      return 'bg-yellow-100 text-yellow-800';
    case 'up_to_date':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Gets the border color for task status indicators
 */
export const getStatusBorderColor = (status: TaskStatus): string => {
  switch (status) {
    case 'overdue':
      return 'border-l-2 border-red-500';
    case 'due_soon':
      return 'border-l-2 border-yellow-500';
    case 'up_to_date':
      return 'border-l-2 border-green-500';
    case 'completed':
      return 'border-l-2 border-gray-500';
    default:
      return 'border-l-2 border-gray-500';
  }
};

/**
 * Filters tasks by calculated status (ignoring stored status for non-completed tasks)
 */
export const filterTasksByStatus = (tasks: TaskWithStatus[], targetStatus: TaskStatus): TaskWithStatus[] => {
  return tasks.filter(task => {
    // Always respect completed status from database
    if (task.status === 'completed') {
      return targetStatus === 'completed';
    }
    
    // For non-completed tasks, calculate status based on due date
    const calculatedStatus = calculateTaskStatus(task.date);
    return calculatedStatus === targetStatus;
  });
};

/**
 * Gets task counts by status for dashboard statistics
 */
export const getTaskStatusCounts = (tasks: TaskWithStatus[]) => {
  const counts = {
    up_to_date: 0,
    due_soon: 0,
    overdue: 0,
    completed: 0
  };

  tasks.forEach(task => {
    if (task.status === 'completed') {
      counts.completed++;
    } else {
      const calculatedStatus = calculateTaskStatus(task.date);
      counts[calculatedStatus]++;
    }
  });

  return counts;
};
