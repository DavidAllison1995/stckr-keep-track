
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { Clock } from 'lucide-react';
import { filterTasksByStatus } from '@/utils/taskStatus';

const DueSoonTasksPage = () => {
  const filterDueSoonTasks = (tasks: any[]) => {
    console.log('DueSoonTasksPage - Filtering tasks. Total tasks:', tasks.length);
    
    const filtered = filterTasksByStatus(tasks, 'due_soon');
    
    console.log('DueSoonTasksPage - Filtered result:', filtered.length);
    return filtered;
  };

  return (
    <TaskStatusPage
      title="Due Soon Tasks"
      description="Tasks due within 14 days"
      icon={Clock}
      color="text-yellow-600"
      filterTasks={filterDueSoonTasks}
      emptyStateMessage="Heads-up! You have tasks due soon ⏳"
      emptyStateEmoji="⏳"
    />
  );
};

export default DueSoonTasksPage;
