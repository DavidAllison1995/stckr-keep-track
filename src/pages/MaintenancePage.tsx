
import { useNavigate } from 'react-router-dom';
import MaintenanceCalendar from '@/components/maintenance/MaintenanceCalendar';

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

  return <MaintenanceCalendar onNavigateToItem={handleNavigateToItem} />;
};

export default MaintenancePage;
