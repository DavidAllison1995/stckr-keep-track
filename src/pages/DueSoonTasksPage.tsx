
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { Clock } from 'lucide-react';

const DueSoonTasksPage = () => {
  const filterDueSoonTasks = (tasks: any[]) => {
    return tasks.filter(task => task.status === 'due_soon');
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
