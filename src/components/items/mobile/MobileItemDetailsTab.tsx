
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { Item } from '@/hooks/useSupabaseItems';
import MobileMaintenanceSummaryCard from './MobileMaintenanceSummaryCard';
import MobileDocumentsCard from './MobileDocumentsCard';
import MobileItemInfoCard from './MobileItemInfoCard';
import MobileItemPhotoCard from './MobileItemPhotoCard';

interface MobileItemDetailsTabProps {
  item: Item;
  onTabChange?: (tab: string) => void;
}

const MobileItemDetailsTab = ({ item, onTabChange }: MobileItemDetailsTabProps) => {
  const { getTasksByItem } = useSupabaseMaintenance();

  // Get active and completed tasks for this item
  const activeTasks = getTasksByItem(item.id, false);
  const allTasks = getTasksByItem(item.id, true);
  const completedTasks = allTasks.filter(task => task.status === 'completed');

  // Calculate next task and recently completed
  const nextTask = activeTasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  
  const recentCompleted = completedTasks
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  return (
    <div className="space-y-4">
      <MobileItemPhotoCard item={item} />
      <MobileItemInfoCard item={item} />
      <MobileMaintenanceSummaryCard 
        nextTask={nextTask}
        recentCompleted={recentCompleted}
        onTabChange={onTabChange}
      />
      <MobileDocumentsCard item={item} onTabChange={onTabChange} />
    </div>
  );
};

export default MobileItemDetailsTab;
