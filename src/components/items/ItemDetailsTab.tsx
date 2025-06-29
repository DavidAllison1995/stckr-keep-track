
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { Item } from '@/hooks/useSupabaseItems';
import { useIsMobile } from '@/hooks/use-mobile';
import ItemInfoCard from './ItemInfoCard';
import ItemPhotoCard from './ItemPhotoCard';
import MaintenanceSummaryCard from './MaintenanceSummaryCard';
import DocumentsCard from './DocumentsCard';
import MobileItemDetailsTab from './mobile/MobileItemDetailsTab';

interface ItemDetailsTabProps {
  item: Item;
  onTabChange?: (tab: string) => void;
}

const ItemDetailsTab = ({ item, onTabChange }: ItemDetailsTabProps) => {
  const isMobile = useIsMobile();
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

  if (isMobile) {
    return <MobileItemDetailsTab item={item} onTabChange={onTabChange} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <ItemPhotoCard item={item} />
        <ItemInfoCard item={item} />
      </div>
      <div className="space-y-6">
        <MaintenanceSummaryCard 
          nextTask={nextTask}
          recentCompleted={recentCompleted}
          onTabChange={onTabChange}
        />
        <DocumentsCard item={item} onTabChange={onTabChange} />
      </div>
    </div>
  );
};

export default ItemDetailsTab;
