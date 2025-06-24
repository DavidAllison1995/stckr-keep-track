
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { CheckCircle } from 'lucide-react';
import { filterTasksByStatus } from '@/utils/taskStatus';

const UpToDateTasksPage = () => {
  const filterUpToDateTasks = (tasks: any[]) => {
    console.log('UpToDateTasksPage - Filtering tasks. Total tasks:', tasks.length);
    
    const filtered = filterTasksByStatus(tasks, 'up_to_date');
    
    console.log('UpToDateTasksPage - Filtered result:', filtered.length);
    return filtered;
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
