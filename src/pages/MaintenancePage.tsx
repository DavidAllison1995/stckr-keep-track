
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8">
            <MaintenanceCalendar onNavigateToItem={handleNavigateToItem} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
