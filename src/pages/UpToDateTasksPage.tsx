
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { CheckCircle } from 'lucide-react';

const UpToDateTasksPage = () => {
  const filterUpToDateTasks = (tasks: any[]) => {
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => {
      // Skip completed tasks
      if (task.status === 'completed') return false;
      
      const taskDate = new Date(task.date);
      // Task is up-to-date if it's due more than 14 days from now
      return taskDate > fourteenDaysFromNow;
    });
  };

  return (
    <TaskStatusPage
      title="Up-to-Date Tasks"
      description="Tasks due in 14+ days"
      icon={CheckCircle}
      color="text-green-600"
      filterTasks={filterUpToDateTasks}
    />
  );
};

export default UpToDateTasksPage;
