
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { AlertTriangle } from 'lucide-react';

const OverdueTasksPage = () => {
  const filterOverdueTasks = (tasks: any[]) => {
    return tasks.filter(task => task.status === 'overdue');
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
