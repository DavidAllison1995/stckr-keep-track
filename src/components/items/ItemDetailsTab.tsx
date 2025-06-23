
import { useSupabaseMaintenance } from '@/hooks/useSupabaseMaintenance';
import { Item } from '@/hooks/useSupabaseItems';
import MaintenanceSummaryCard from './MaintenanceSummaryCard';
import DocumentsCard from './DocumentsCard';
import ItemInfoCard from './ItemInfoCard';
import ItemPhotoCard from './ItemPhotoCard';

interface ItemDetailsTabProps {
  item: Item;
  onTabChange?: (tab: string) => void;
}

const ItemDetailsTab = ({ item, onTabChange }: ItemDetailsTabProps) => {
  const { getTasksByItem } = useSupabaseMaintenance();

  // Get active and completed tasks for this item
  const activeTasks = getTasksByItem(item.id, false); // Don't include completed
  const allTasks = getTasksByItem(item.id, true); // Include completed
  const completedTasks = allTasks.filter(task => task.status === 'completed');

  // Calculate next task and recently completed
  const nextTask = activeTasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  
  const recentCompleted = completedTasks
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  return (
    <div className="mobile-spacing">
      {/* Mobile-first stacked layout */}
      <div className="space-y-4 sm:space-y-6">
        {/* Photo Card - Full width on mobile */}
        <div className="w-full">
          <ItemPhotoCard item={item} />
        </div>

        {/* Item Information Card - Full width on mobile */}
        <div className="w-full">
          <ItemInfoCard item={item} />
        </div>

        {/* Maintenance Summary Card - Full width on mobile */}
        <div className="w-full">
          <MaintenanceSummaryCard 
            nextTask={nextTask}
            recentCompleted={recentCompleted}
            onTabChange={onTabChange}
          />
        </div>

        {/* Documents Card - Full width on mobile */}
        <div className="w-full">
          <DocumentsCard item={item} onTabChange={onTabChange} />
        </div>
      </div>

      {/* Desktop: Grid layout for larger screens */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 -mt-4 sm:-mt-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ItemPhotoCard item={item} />
            <ItemInfoCard item={item} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <MaintenanceSummaryCard 
              nextTask={nextTask}
              recentCompleted={recentCompleted}
              onTabChange={onTabChange}
            />
            <DocumentsCard item={item} onTabChange={onTabChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsTab;
