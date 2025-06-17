
import Profile from '@/components/profile/Profile';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8">
            <Profile />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
