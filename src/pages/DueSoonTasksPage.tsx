
import TaskStatusPage from '@/components/tasks/TaskStatusPage';
import { Clock } from 'lucide-react';

const DueSoonTasksPage = () => {
  const filterDueSoonTasks = (tasks: any[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    fourteenDaysFromNow.setHours(23, 59, 59, 999); // End of the 14th day
    
    console.log('DueSoonTasksPage - Filtering tasks. Total tasks:', tasks.length);
    console.log('DueSoonTasksPage - Date range:', now.toDateString(), 'to', fourteenDaysFromNow.toDateString());
    
    const filtered = tasks.filter(task => {
      // Skip completed tasks
      if (task.status === 'completed') return false;
      
      const taskDate = new Date(task.date);
      // Task is due soon if it's between now and 14 days from now
      const isDueSoon = taskDate >= now && taskDate <= fourteenDaysFromNow;
      
      console.log(`Task "${task.title}" - Due: ${task.date}, Is due soon: ${isDueSoon}`);
      
      return isDueSoon;
    });
    
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
    />
  );
};

export default DueSoonTasksPage;
