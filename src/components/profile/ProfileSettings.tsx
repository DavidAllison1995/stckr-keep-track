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
      <div className="min-h-screen bg-[#0d0f1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9333ea]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f1a] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-2xl border border-gray-700/50 backdrop-blur-sm shadow-2xl">
            <div className="w-8 h-8 bg-[#9333ea] rounded-lg flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Profile <span className="text-[#9333ea] bg-gradient-to-r from-[#9333ea] to-[#a855f7] bg-clip-text text-transparent">Settings</span>
            </h1>
          </div>
          <p className="text-zinc-400 text-lg font-medium">
            Manage your profile information and notification preferences
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-6">
          {/* Profile Information Section */}
          <AccordionItem value="profile" className="border-0">
            <Card className="bg-[#1c1c1c] border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(147,51,234,0.15)] transition-all duration-300 hover:border-[#9333ea]/30">
              <AccordionTrigger className="px-6 py-6 hover:no-underline group">
                <CardHeader className="p-0 flex-row items-center gap-4">
                  <div className="w-10 h-10 bg-[#9333ea] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-xl font-bold text-white group-hover:text-[#9333ea] transition-colors duration-300">
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-zinc-400 font-medium">
                      Update your personal information and profile picture
                    </CardDescription>
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-8 pt-2 pb-8 px-6">
                  {/* Profile Picture Upload */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24 border-4 border-[#9333ea]/30 shadow-xl">
                      <AvatarImage src={profileImageUrl || undefined} alt="Profile" />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-[#9333ea] to-[#a855f7] text-white font-bold">
                        {firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="profile-image" className="cursor-pointer">
                        <div className="flex items-center gap-3 bg-[#9333ea] text-white px-6 py-3 rounded-xl hover:bg-[#a855f7] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
                          <Upload className="w-5 h-5" />
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
                      <p className="text-sm text-zinc-500 mt-2 font-medium">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="first-name" className="text-white font-semibold text-sm">First Name</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        className="bg-gray-800/80 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#9333ea] focus:ring-[#9333ea]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="last-name" className="text-white font-semibold text-sm">Last Name</Label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        className="bg-gray-800/80 border-gray-600 text-white placeholder:text-gray-400 focus:border-[#9333ea] focus:ring-[#9333ea]/20 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Email Field (Read-only) */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-white font-semibold text-sm">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-800/50 border-gray-600 text-gray-300 rounded-lg"
                    />
                    <p className="text-sm text-zinc-500 font-medium">
                      Contact support to change your email address
                    </p>
                  </div>

                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    className="bg-[#9333ea] hover:bg-[#a855f7] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Notification Preferences Section */}
          <AccordionItem value="notifications" className="border-0">
            <Card className="bg-[#1c1c1c] border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(147,51,234,0.15)] transition-all duration-300 hover:border-[#9333ea]/30">
              <AccordionTrigger className="px-6 py-6 hover:no-underline group">
                <CardHeader className="p-0 flex-row items-center gap-4">
                  <div className="w-10 h-10 bg-[#9333ea] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-xl font-bold text-white group-hover:text-[#9333ea] transition-colors duration-300">
                      Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-zinc-400 font-medium">
                      Choose which notifications you want to receive
                    </CardDescription>
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-6 pt-2 pb-8 px-6">
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-colors duration-200">
                    <div className="space-y-1">
                      <Label className="text-white font-semibold">Task Created</Label>
                      <p className="text-sm text-zinc-400">
                        Get notified when new maintenance tasks are created
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taskCreated}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, taskCreated: checked }))
                      }
                      className="data-[state=checked]:bg-[#9333ea]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-colors duration-200">
                    <div className="space-y-1">
                      <Label className="text-white font-semibold">Task Due Soon</Label>
                      <p className="text-sm text-zinc-400">
                        Get notified when maintenance tasks are due within 3 days
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taskDueSoon}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, taskDueSoon: checked }))
                      }
                      className="data-[state=checked]:bg-[#9333ea]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-colors duration-200">
                    <div className="space-y-1">
                      <Label className="text-white font-semibold">Task Due Today</Label>
                      <p className="text-sm text-zinc-400">
                        Get notified when maintenance tasks are due today
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taskDueToday}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, taskDueToday: checked }))
                      }
                      className="data-[state=checked]:bg-[#9333ea]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-colors duration-200">
                    <div className="space-y-1">
                      <Label className="text-white font-semibold">Task Overdue</Label>
                      <p className="text-sm text-zinc-400">
                        Get notified when maintenance tasks are past their due date
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taskOverdue}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, taskOverdue: checked }))
                      }
                      className="data-[state=checked]:bg-[#9333ea]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-colors duration-200">
                    <div className="space-y-1">
                      <Label className="text-white font-semibold">Task Updated</Label>
                      <p className="text-sm text-zinc-400">
                        Get notified when maintenance tasks are edited or updated
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taskUpdated}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, taskUpdated: checked }))
                      }
                      className="data-[state=checked]:bg-[#9333ea]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-colors duration-200">
                    <div className="space-y-1">
                      <Label className="text-white font-semibold">Task Completed</Label>
                      <p className="text-sm text-zinc-400">
                        Get notified when tasks are marked as completed
                      </p>
                    </div>
                    <Switch
                      checked={notifications.taskCompleted}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, taskCompleted: checked }))
                      }
                      className="data-[state=checked]:bg-[#9333ea]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-colors duration-200">
                    <div className="space-y-1">
                      <Label className="text-white font-semibold">Recurring Task Reminder</Label>
                      <p className="text-sm text-zinc-400">
                        Get notified 3 days before recurring tasks are due
                      </p>
                    </div>
                    <Switch
                      checked={notifications.recurringTaskReminder}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, recurringTaskReminder: checked }))
                      }
                      className="data-[state=checked]:bg-[#9333ea]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-colors duration-200">
                    <div className="space-y-1">
                      <Label className="text-white font-semibold">Warranty Expiring</Label>
                      <p className="text-sm text-zinc-400">
                        Get notified when item warranties are about to expire
                      </p>
                    </div>
                    <Switch
                      checked={notifications.warrantyExpiring}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, warrantyExpiring: checked }))
                      }
                      className="data-[state=checked]:bg-[#9333ea]"
                    />
                  </div>

                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={isSaving}
                    className="bg-[#9333ea] hover:bg-[#a855f7] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    {isSaving ? 'Saving...' : 'Save Notification Preferences'}
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Account Security Section */}
          <AccordionItem value="security" className="border-0">
            <Card className="bg-[#1c1c1c] border-gray-700/50 rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(147,51,234,0.15)] transition-all duration-300 hover:border-[#9333ea]/30">
              <AccordionTrigger className="px-6 py-6 hover:no-underline group">
                <CardHeader className="p-0 flex-row items-center gap-4">
                  <div className="w-10 h-10 bg-[#9333ea] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-xl font-bold text-white group-hover:text-[#9333ea] transition-colors duration-300">
                      Account Security
                    </CardTitle>
                    <CardDescription className="text-zinc-400 font-medium">
                      Manage your account security and data
                    </CardDescription>
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-6 pt-2 pb-8 px-6">
                  <div className="flex items-center justify-between p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-all duration-200">
                    <div className="space-y-2">
                      <h4 className="font-bold text-white text-lg">Change Password</h4>
                      <p className="text-sm text-zinc-400 font-medium">
                        Update your account password for better security
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowChangePassword(true)}
                      className="bg-transparent border-[#9333ea] text-[#9333ea] hover:bg-[#9333ea] hover:text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-[#9333ea]/30 transition-all duration-200">
                    <div className="space-y-2">
                      <h4 className="font-bold text-white text-lg">Connected Accounts</h4>
                      <p className="text-sm text-zinc-400 font-medium">
                        Manage your connected social accounts
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setShowConnectedAccounts(true)}
                      className="bg-transparent border-[#9333ea] text-[#9333ea] hover:bg-[#9333ea] hover:text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all duration-200">
                    <div className="space-y-2">
                      <h4 className="font-bold text-white text-lg">Log Out</h4>
                      <p className="text-sm text-zinc-400 font-medium">
                        Sign out of your account
                      </p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={handleLogout}
                      className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white font-semibold rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-red-900/20 rounded-xl border border-red-600/30 hover:border-red-500/50 transition-all duration-200">
                    <div className="space-y-2">
                      <h4 className="font-bold text-red-400 text-lg">Delete Account</h4>
                      <p className="text-sm text-zinc-400 font-medium">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={() => setShowDeleteAccount(true)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200"
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
    </div>
  );
};

export default ProfileSettings;
