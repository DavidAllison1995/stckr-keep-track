
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Shield,
  Upload,
  User,
  Key,
  Link,
  Trash,
  LogOut,
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import { UserSettings } from '@/types/settings';
import ChangePasswordDialog from './ChangePasswordDialog';
import ConnectedAccountsDialog from './ConnectedAccountsDialog';
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
    taskCompleted: false,
    taskCreated: false,
    taskUpdated: true,
    recurringTaskReminder: true,
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showConnectedAccounts, setShowConnectedAccounts] = useState(false);
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
      setNotifications(settings.notifications);
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
        title: 'Success',
        description: 'Profile updated successfully',
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
          taskDueSoon: notifications.taskDueSoon,
          taskOverdue: notifications.taskOverdue,
          taskDueToday: notifications.taskDueToday,
          warrantyExpiring: notifications.warrantyExpiring,
          taskCompleted: notifications.taskCompleted,
          taskCreated: notifications.taskCreated,
          taskUpdated: notifications.taskUpdated,
          recurringTaskReminder: notifications.recurringTaskReminder,
        },
        showCompletedTasks: settings.showCompletedTasks,
      };

      const result = await updateSettings(newSettings);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Settings saved successfully',
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
      const filePath = `profile-images/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (storageError) throw storageError;

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${filePath}`;
      setProfileImageUrl(publicUrl);

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile information and notification preferences</p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {/* Profile Information Section */}
        <AccordionItem value="profile" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-left">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-left">
                  Update your personal information and profile picture
                </CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-6 pt-0">
                {/* Profile Picture Upload */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profileImageUrl || undefined} alt="Profile" />
                    <AvatarFallback className="text-lg">
                      {firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="profile-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
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
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Email Field (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">
                    Contact support to change your email address
                  </p>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Notification Preferences Section */}
        <AccordionItem value="notifications" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-left">
                  Choose which notifications you want to receive
                </CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Created</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when new maintenance tasks are created
                    </p>
                  </div>
                  <Switch
                    checked={notifications.taskCreated}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, taskCreated: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Due Soon</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when maintenance tasks are due within 3 days
                    </p>
                  </div>
                  <Switch
                    checked={notifications.taskDueSoon}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, taskDueSoon: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Due Today</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when maintenance tasks are due today
                    </p>
                  </div>
                  <Switch
                    checked={notifications.taskDueToday}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, taskDueToday: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Overdue</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when maintenance tasks are past their due date
                    </p>
                  </div>
                  <Switch
                    checked={notifications.taskOverdue}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, taskOverdue: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Updated</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when maintenance tasks are edited or updated
                    </p>
                  </div>
                  <Switch
                    checked={notifications.taskUpdated}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, taskUpdated: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Completed</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when tasks are marked as completed
                    </p>
                  </div>
                  <Switch
                    checked={notifications.taskCompleted}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, taskCompleted: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recurring Task Reminder</Label>
                    <p className="text-sm text-gray-500">
                      Get notified 3 days before recurring tasks are due
                    </p>
                  </div>
                  <Switch
                    checked={notifications.recurringTaskReminder}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, recurringTaskReminder: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Warranty Expiring</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when item warranties are about to expire
                    </p>
                  </div>
                  <Switch
                    checked={notifications.warrantyExpiring}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, warrantyExpiring: checked }))
                    }
                  />
                </div>

                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Notification Preferences'}
                </Button>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Account Security Section */}
        <AccordionItem value="security" className="border rounded-lg">
          <Card className="border-0">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2 text-left">
                  <Shield className="w-5 h-5" />
                  Account Security
                </CardTitle>
                <CardDescription className="text-left">
                  Manage your account security and data
                </CardDescription>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-gray-500">
                      Update your account password for better security
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowChangePassword(true)}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Connected Accounts</h4>
                    <p className="text-sm text-gray-500">
                      Manage your connected social accounts
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setShowConnectedAccounts(true)}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">Log Out</h4>
                    <p className="text-sm text-gray-500">
                      Sign out of your account
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                  <div className="space-y-1">
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => setShowDeleteAccount(true)}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>

      <ChangePasswordDialog 
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
      
      <ConnectedAccountsDialog 
        open={showConnectedAccounts}
        onOpenChange={setShowConnectedAccounts}
      />
      
      <DeleteAccountDialog 
        open={showDeleteAccount}
        onOpenChange={setShowDeleteAccount}
      />
    </div>
  );
};

export default ProfileSettings;
