
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { AlertTriangle } from 'lucide-react';
import { filterTasksByStatus } from '@/utils/taskStatus';

const OverdueTasksPage = () => {
  const filterOverdueTasks = (tasks: any[]) => {
    console.log('OverdueTasksPage - Filtering tasks. Total tasks:', tasks.length);
    
    const filtered = filterTasksByStatus(tasks, 'overdue');
    
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
