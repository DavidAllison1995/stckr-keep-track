
import { useNavigate } from 'react-router-dom';
import { UserSettingsProvider } from '@/contexts/UserSettingsContext';
import MaintenanceCalendarWithSettings from '@/components/maintenance/MaintenanceCalendarWithSettings';
import StatusBar from '@/components/maintenance/StatusBar';
import { useIsMobile } from '@/hooks/use-mobile';

const MaintenancePage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNavigateToItem = (itemId: string, taskId?: string) => {
    const params = new URLSearchParams();
    params.set('tab', 'maintenance');
    if (taskId) {
      params.set('highlight', taskId);
    }
    navigate(`/items/${itemId}?${params.toString()}`);
  };

  return (
    <UserSettingsProvider>
      <div className="space-y-6">
        {/* Hide StatusBar on mobile - only show on desktop */}
        {!isMobile && <StatusBar />}
        <MaintenanceCalendarWithSettings onNavigateToItem={handleNavigateToItem} />
      </div>
    </UserSettingsProvider>
  );
};

export default MaintenancePage;
