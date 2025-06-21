
import Dashboard from '@/components/dashboard/Dashboard';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Dashboard onTabChange={() => {}} />
      </div>
    </div>
  );
};

export default DashboardPage;
