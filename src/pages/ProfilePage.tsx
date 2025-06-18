
import Profile from '@/components/profile/Profile';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8">
            <Profile />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
