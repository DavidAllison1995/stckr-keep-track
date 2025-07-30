import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Upload,
  User,
  LogOut,
  Settings,
  Trash,
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import { UserSettings } from '@/types/settings';
import ChangePasswordDialog from './ChangePasswordDialog';
import DeleteAccountDialog from './DeleteAccountDialog';

const ProfileSettings = () => {
  const { user, logout } = useSupabaseAuth();
  const { toast } = useToast();
  const { settings, updateSettings, isLoading } = useUserSettingsContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    taskDueSoon: true,
    taskOverdue: true,
    taskDueToday: true,
    warrantyExpiring: true,
    recurringTaskReminder: true,
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        }

        if (data) {
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setProfileImageUrl(data.profile_image_url || undefined);
        }
      };

      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setNotifications({
        taskDueSoon: settings.notifications.taskDueSoon,
        taskOverdue: settings.notifications.taskOverdue,
        taskDueToday: settings.notifications.taskDueToday,
        warrantyExpiring: settings.notifications.warrantyExpiring,
        recurringTaskReminder: settings.notifications.recurringTaskReminder,
      });
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          profile_image_url: profileImageUrl,
        });

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const newSettings: UserSettings = {
        notifications: {
          ...notifications,
          taskCompleted: false,
          taskCreated: false,
          taskUpdated: false,
        },
        showCompletedTasks: settings.showCompletedTasks,
      };

      const result = await updateSettings(newSettings);
      
      if (result.success) {
        toast({
          title: 'Settings saved',
          description: 'Your notification preferences have been updated',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      setProfileImageUrl(data.publicUrl);

      toast({
        title: 'Profile picture updated',
        description: 'Your profile picture has been updated successfully',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header with Logout */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
              <p className="text-sm text-gray-400">Manage your account preferences</p>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="bg-red-600/10 border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-500 font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-purple-500/30">
                  <AvatarImage src={profileImageUrl || undefined} alt="Profile" />
                  <AvatarFallback className="text-lg bg-purple-600 text-white font-semibold">
                    {firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <div className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </div>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name" className="text-white font-medium">First Name</Label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name" className="text-white font-medium">Last Name</Label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-800/50 border-gray-700 text-gray-400"
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-400" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <Label className="text-white font-medium">Task Due Soon</Label>
                  <p className="text-sm text-gray-400">Get notified 3 days before tasks are due</p>
                </div>
                <Switch
                  checked={notifications.taskDueSoon}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, taskDueSoon: checked }))
                  }
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <Label className="text-white font-medium">Task Due Today</Label>
                  <p className="text-sm text-gray-400">Get notified when tasks are due today</p>
                </div>
                <Switch
                  checked={notifications.taskDueToday}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, taskDueToday: checked }))
                  }
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <Label className="text-white font-medium">Overdue Tasks</Label>
                  <p className="text-sm text-gray-400">Get notified when tasks are overdue</p>
                </div>
                <Switch
                  checked={notifications.taskOverdue}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, taskOverdue: checked }))
                  }
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <Label className="text-white font-medium">Warranty Expiring</Label>
                  <p className="text-sm text-gray-400">Get notified when warranties expire soon</p>
                </div>
                <Switch
                  checked={notifications.warrantyExpiring}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, warrantyExpiring: checked }))
                  }
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <Label className="text-white font-medium">Recurring Task Reminders</Label>
                  <p className="text-sm text-gray-400">Get reminders for recurring tasks</p>
                </div>
                <Switch
                  checked={notifications.recurringTaskReminder}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, recurringTaskReminder: checked }))
                  }
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium w-full"
              >
                {isSaving ? 'Saving...' : 'Save Notifications'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline"
                onClick={() => setShowChangePassword(true)}
                className="w-full justify-start bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Change Password
              </Button>

              <Separator className="bg-gray-800" />

              <Button 
                variant="outline"
                onClick={() => setShowDeleteAccount(true)}
                className="w-full justify-start bg-red-600/10 border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-500"
              >
                <Trash className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>

        <ChangePasswordDialog 
          open={showChangePassword}
          onOpenChange={setShowChangePassword}
        />
        
        <DeleteAccountDialog 
          open={showDeleteAccount}
          onOpenChange={setShowDeleteAccount}
        />
      </div>
    </div>
  );
};

export default ProfileSettings;
