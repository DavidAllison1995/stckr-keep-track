
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { AlertTriangle } from 'lucide-react';

const OverdueTasksPage = () => {
  const filterOverdueTasks = (tasks: any[]) => {
    const now = new Date();
    
    return tasks.filter(task => {
      // Skip completed tasks
      if (task.status === 'completed') return false;
      
      const taskDate = new Date(task.date);
      // Task is overdue if it's past the due date
      return taskDate < now;
    });
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
