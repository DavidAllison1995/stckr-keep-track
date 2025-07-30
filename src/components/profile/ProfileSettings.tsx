import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
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
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Bell,
  Upload,
  User,
  LogOut,
  Settings,
  Trash,
  ChevronDown,
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
  const isMobile = useIsMobile();

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
    <div className="min-h-screen bg-gray-950 py-4 sm:py-8">
      <div className={`container mx-auto px-3 sm:px-4 ${isMobile ? 'max-w-full' : 'max-w-2xl'}`}>
        {/* Compact Header with Logout */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Profile</h1>
              {!isMobile && <p className="text-sm text-gray-400">Manage your account</p>}
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            size={isMobile ? "sm" : "default"}
            className="bg-red-600/10 border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-500 font-medium"
          >
            <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
            {isMobile ? 'Logout' : 'Log Out'}
          </Button>
        </div>

        <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
          {/* Profile Information */}
          <AccordionItem value="profile" className="border-0">
            <Card className="bg-gray-900 border-gray-800">
              <AccordionTrigger className="px-3 sm:px-4 py-3 sm:py-4 hover:no-underline">
                <CardHeader className="p-0 flex-row items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-base sm:text-lg font-semibold text-white">
                      Profile Information
                    </CardTitle>
                    {!isMobile && (
                      <p className="text-sm text-gray-400">Update your personal details</p>
                    )}
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-4 sm:space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} border-2 border-purple-500/30`}>
                      <AvatarImage src={profileImageUrl || undefined} alt="Profile" />
                      <AvatarFallback className={`${isMobile ? 'text-sm' : 'text-lg'} bg-purple-600 text-white font-semibold`}>
                        {firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="profile-image" className="cursor-pointer">
                        <div className={`flex items-center gap-2 bg-purple-600 text-white ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-lg hover:bg-purple-700 transition-colors font-medium`}>
                          <Upload className="w-4 h-4" />
                          {isMobile ? 'Upload' : 'Upload Photo'}
                        </div>
                        <Input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </Label>
                      {!isMobile && <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>}
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                    <div className="space-y-2">
                      <Label htmlFor="first-name" className="text-white font-medium text-sm">First Name</Label>
                      <Input
                        id="first-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className={`bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 ${isMobile ? 'h-9 text-sm' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name" className="text-white font-medium text-sm">Last Name</Label>
                      <Input
                        id="last-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className={`bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 ${isMobile ? 'h-9 text-sm' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Email Field (Read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className={`bg-gray-800/50 border-gray-700 text-gray-400 ${isMobile ? 'h-9 text-sm' : ''}`}
                    />
                  </div>

                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isSaving}
                    size={isMobile ? "sm" : "default"}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium w-full"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Notifications */}
          <AccordionItem value="notifications" className="border-0">
            <Card className="bg-gray-900 border-gray-800">
              <AccordionTrigger className="px-3 sm:px-4 py-3 sm:py-4 hover:no-underline">
                <CardHeader className="p-0 flex-row items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-base sm:text-lg font-semibold text-white">
                      Notifications
                    </CardTitle>
                    {!isMobile && (
                      <p className="text-sm text-gray-400">Manage notification preferences</p>
                    )}
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                  <div className={`flex items-center justify-between ${isMobile ? 'py-2' : 'p-3'} bg-gray-800/50 rounded-lg`}>
                    <div>
                      <Label className="text-white font-medium text-sm">Task Due Soon</Label>
                      {!isMobile && <p className="text-xs text-gray-400">3 days before due date</p>}
                    </div>
                    <Switch
                      checked={notifications.taskDueSoon}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, taskDueSoon: checked }))
                      }
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>

                  <div className={`flex items-center justify-between ${isMobile ? 'py-2' : 'p-3'} bg-gray-800/50 rounded-lg`}>
                    <div>
                      <Label className="text-white font-medium text-sm">Due Today</Label>
                      {!isMobile && <p className="text-xs text-gray-400">Tasks due today</p>}
                    </div>
                    <Switch
                      checked={notifications.taskDueToday}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, taskDueToday: checked }))
                      }
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>

                  <div className={`flex items-center justify-between ${isMobile ? 'py-2' : 'p-3'} bg-gray-800/50 rounded-lg`}>
                    <div>
                      <Label className="text-white font-medium text-sm">Overdue Tasks</Label>
                      {!isMobile && <p className="text-xs text-gray-400">Past due date</p>}
                    </div>
                    <Switch
                      checked={notifications.taskOverdue}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, taskOverdue: checked }))
                      }
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>

                  <div className={`flex items-center justify-between ${isMobile ? 'py-2' : 'p-3'} bg-gray-800/50 rounded-lg`}>
                    <div>
                      <Label className="text-white font-medium text-sm">Warranty Expiring</Label>
                      {!isMobile && <p className="text-xs text-gray-400">Before warranty expires</p>}
                    </div>
                    <Switch
                      checked={notifications.warrantyExpiring}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, warrantyExpiring: checked }))
                      }
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>

                  <div className={`flex items-center justify-between ${isMobile ? 'py-2' : 'p-3'} bg-gray-800/50 rounded-lg`}>
                    <div>
                      <Label className="text-white font-medium text-sm">Recurring Reminders</Label>
                      {!isMobile && <p className="text-xs text-gray-400">For recurring tasks</p>}
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
                    size={isMobile ? "sm" : "default"}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium w-full"
                  >
                    {isSaving ? 'Saving...' : 'Save Notifications'}
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>

          {/* Account Actions */}
          <AccordionItem value="account" className="border-0">
            <Card className="bg-gray-900 border-gray-800">
              <AccordionTrigger className="px-3 sm:px-4 py-3 sm:py-4 hover:no-underline">
                <CardHeader className="p-0 flex-row items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-base sm:text-lg font-semibold text-white">
                      Account Settings
                    </CardTitle>
                    {!isMobile && (
                      <p className="text-sm text-gray-400">Security and account options</p>
                    )}
                  </div>
                </CardHeader>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
                  <Button 
                    variant="outline"
                    onClick={() => setShowChangePassword(true)}
                    size={isMobile ? "sm" : "default"}
                    className="w-full justify-start bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>

                  <Separator className="bg-gray-800" />

                  <Button 
                    variant="outline"
                    onClick={() => setShowDeleteAccount(true)}
                    size={isMobile ? "sm" : "default"}
                    className="w-full justify-start bg-red-600/10 border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white hover:border-red-500"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </CardContent>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

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
