
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { AlertTriangle } from 'lucide-react';

const OverdueTasksPage = () => {
  const filterOverdueTasks = (tasks: any[]) => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today
    
    console.log('OverdueTasksPage - Filtering tasks. Total tasks:', tasks.length);
    
    const filtered = tasks.filter(task => {
      // Skip completed tasks
      if (task.status === 'completed') return false;
      
      const taskDate = new Date(task.date);
      // Task is overdue if it's past the due date
      const isOverdue = taskDate < now;
      
      console.log(`Task "${task.title}" - Due: ${task.date}, Is overdue: ${isOverdue}`);
      
      return isOverdue;
    });
    
    console.log('OverdueTasksPage - Filtered result:', filtered.length);
    return filtered;
  };

  return (
    <TaskStatusPage
      title="Overdue Tasks"
      description="Tasks past due date"
      icon={AlertTriangle}
      color="text-red-600"
      filterTasks={filterOverdueTasks}
    />
  );
};

export default OverdueTasksPage;
