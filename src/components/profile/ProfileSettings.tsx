import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  Settings,
  Shield,
  Upload,
  User,
  Key,
  Link,
  Trash,
} from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import { UserSettings } from '@/types/settings';
import ChangePasswordDialog from './ChangePasswordDialog';
import ConnectedAccountsDialog from './ConnectedAccountsDialog';
import DeleteAccountDialog from './DeleteAccountDialog';

interface ProfileSettingsProps {
  // No props needed for now
}

const ProfileSettings = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const { settings, updateSettings, isLoading } = useUserSettingsContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('month');
  const [dateFormat, setDateFormat] = useState<'MM/dd/yyyy' | 'dd/MM/yyyy'>('MM/dd/yyyy');
  const [qrScanSound, setQrScanSound] = useState(true);
  const [notifications, setNotifications] = useState({
    taskDueSoon: true,
    taskOverdue: true,
    warrantyExpiring: true,
    taskCompleted: false,
    taskCreated: false,
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
      setCalendarView(settings.calendar.defaultView);
      setDateFormat(settings.calendar.dateFormat);
      setQrScanSound(settings.qrScanSound === undefined ? true : settings.qrScanSound);
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
          warrantyExpiring: notifications.warrantyExpiring,
          taskCompleted: notifications.taskCompleted,
          taskCreated: notifications.taskCreated,
        },
        calendar: {
          defaultView: calendarView,
          dateFormat: dateFormat,
        },
        qrScanSound: qrScanSound,
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
        <p className="text-gray-600 mt-2">Manage your profile information and app preferences</p>
      </div>

      <div className="space-y-8">
        {/* Profile Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
        </Card>

        {/* App Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              App Preferences
            </CardTitle>
            <CardDescription>
              Customize how the app works for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Calendar View Preference */}
            <div className="space-y-2">
              <Label>Default Calendar View</Label>
              <Select value={calendarView} onValueChange={(value: 'week' | 'month') => setCalendarView(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week View</SelectItem>
                  <SelectItem value="month">Month View</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Choose your preferred view when opening the maintenance calendar
              </p>
            </div>

            {/* Date Format Preference */}
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={dateFormat} onValueChange={(value: 'MM/dd/yyyy' | 'dd/MM/yyyy') => setDateFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/dd/yyyy">US Format (MM/DD/YYYY)</SelectItem>
                  <SelectItem value="dd/MM/yyyy">International (DD/MM/YYYY)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Choose how dates are displayed throughout the app
              </p>
            </div>

            {/* QR Scan Sound */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>QR Scan Sound</Label>
                <p className="text-sm text-gray-500">
                  Play a sound when successfully scanning QR codes
                </p>
              </div>
              <Switch
                checked={qrScanSound}
                onCheckedChange={setQrScanSound}
              />
            </div>

            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save App Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose which notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Notification Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Account Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your account security and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
        </Card>
      </div>

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
