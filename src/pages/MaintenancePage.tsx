
import { useNavigate } from 'react-router-dom';
import { UserSettingsProvider } from '@/contexts/UserSettingsContext';
import MaintenanceCalendarWithSettings from '@/components/maintenance/MaintenanceCalendarWithSettings';

const MaintenancePage = () => {
  const navigate = useNavigate();

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
      <MaintenanceCalendarWithSettings onNavigateToItem={handleNavigateToItem} />
    </UserSettingsProvider>
  );
};

export default MaintenancePage;
