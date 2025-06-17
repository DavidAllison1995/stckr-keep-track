
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">Notifications</div>
              <div className="text-sm text-gray-600">Manage your notification preferences</div>
            </div>
            <Button variant="ghost" size="sm">Configure</Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">Data Export</div>
              <div className="text-sm text-gray-600">Download your data</div>
            </div>
            <Button variant="ghost" size="sm">Export</Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">Privacy Settings</div>
              <div className="text-sm text-gray-600">Manage your privacy preferences</div>
            </div>
            <Button variant="ghost" size="sm">Manage</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={logout}
            >
              Sign Out
            </Button>
            <Button 
              variant="destructive" 
              className="w-full"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
