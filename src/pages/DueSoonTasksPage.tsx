
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { Clock } from 'lucide-react';

const DueSoonTasksPage = () => {
  const filterDueSoonTasks = (tasks: any[]) => {
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => {
      // Skip completed tasks
      if (task.status === 'completed') return false;
      
      const taskDate = new Date(task.date);
      // Task is due soon if it's between now and 14 days from now
      return taskDate >= now && taskDate <= fourteenDaysFromNow;
    });
  };

  return (
    <TaskStatusPage
      title="Due Soon Tasks"
      description="Tasks due within 14 days"
      icon={Clock}
      color="text-yellow-600"
      filterTasks={filterDueSoonTasks}
    />
  );
};

export default DueSoonTasksPage;
