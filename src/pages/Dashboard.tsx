
import Dashboard from '@/components/dashboard/Dashboard';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8">
            <Dashboard onTabChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
