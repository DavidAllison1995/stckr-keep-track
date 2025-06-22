
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { CheckCircle } from 'lucide-react';

const UpToDateTasksPage = () => {
  const filterUpToDateTasks = (tasks: any[]) => {
    const now = new Date();
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    console.log('UpToDateTasksPage - Filtering tasks. Total tasks:', tasks.length);
    console.log('UpToDateTasksPage - Cutoff date:', fourteenDaysFromNow.toDateString());
    
    const filtered = tasks.filter(task => {
      // Skip completed tasks
      if (task.status === 'completed') return false;
      
      const taskDate = new Date(task.date);
      // Task is up-to-date if it's due more than 14 days from now
      const isUpToDate = taskDate > fourteenDaysFromNow;
      
      console.log(`Task "${task.title}" - Due: ${task.date}, Is up to date: ${isUpToDate}`);
      
      return isUpToDate;
    });
    
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
