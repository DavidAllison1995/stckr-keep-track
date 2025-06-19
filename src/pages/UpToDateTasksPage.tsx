
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { CheckCircle } from 'lucide-react';

const UpToDateTasksPage = () => {
  const filterUpToDateTasks = (tasks: any[]) => {
    return tasks.filter(task => {
      if (task.status === 'up_to_date') return true;
      
      // For pending tasks, check if they're due more than 14 days from now
      if (task.status === 'pending') {
        const taskDate = new Date(task.date);
        const now = new Date();
        const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        return taskDate > fourteenDaysFromNow;
      }
      
      return false;
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
