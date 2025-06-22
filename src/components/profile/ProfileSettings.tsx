
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useUserSettings } from '@/hooks/useUserSettings';
import { supabase } from '@/integrations/supabase/client';
import { Camera } from 'lucide-react';
import ChangePasswordDialog from './ChangePasswordDialog';
import DeleteAccountDialog from './DeleteAccountDialog';

const ProfileSettings = () => {
  const { user } = useSupabaseAuth();
  const { settings, updateSettings, isLoading } = useUserSettings();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    profileImageUrl: '',
  });
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, profile_image_url')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: user?.email || '',
          profileImageUrl: data.profile_image_url || '',
        });
      }
    };
    
    loadProfile();
  }, [user]);

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleProfileImageUpload = async (file: File) => {
    if (!user?.id) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, profileImageUrl: publicUrl }));
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      handleProfileImageUpload(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
        })
        .eq('id', user.id);

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
    console.log('Saving settings:', localSettings);
    const result = await updateSettings(localSettings);
    
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
  };

  const getInitials = () => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
            </div>

            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.profileImageUrl} />
                      <AvatarFallback className="text-lg font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium">Profile Picture</p>
                    <p className="text-sm text-gray-600">Upload a new profile picture</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calendar Default View */}
                <div className="space-y-3">
                  <Label>Default Calendar View</Label>
                  <Select
                    value={localSettings.calendar.defaultView}
                    onValueChange={(value) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        calendar: { ...prev.calendar, defaultView: value as 'week' | 'month' }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Week View</SelectItem>
                      <SelectItem value="month">Month View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Format */}
                <div className="space-y-3">
                  <Label>Date Format</Label>
                  <Select
                    value={localSettings.calendar.dateFormat}
                    onValueChange={(value) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        calendar: { ...prev.calendar, dateFormat: value as 'MM/dd/yyyy' | 'dd/MM/yyyy' }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">US Format (MM/dd/yyyy)</SelectItem>
                      <SelectItem value="dd/MM/yyyy">International Format (dd/MM/yyyy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* QR Scan Sound */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="qr-scan-sound">QR Scan Sound</Label>
                    <p className="text-sm text-muted-foreground">Play sound when scanning QR codes</p>
                  </div>
                  <Switch
                    id="qr-scan-sound"
                    checked={localSettings.qrScanSound || false}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({ ...prev, qrScanSound: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="task-due-soon">Tasks Due Soon</Label>
                    <p className="text-sm text-muted-foreground">Notify 3 days before tasks are due</p>
                  </div>
                  <Switch
                    id="task-due-soon"
                    checked={localSettings.notifications.taskDueSoon}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, taskDueSoon: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="task-overdue">Overdue Tasks</Label>
                    <p className="text-sm text-muted-foreground">Notify when tasks become overdue</p>
                  </div>
                  <Switch
                    id="task-overdue"
                    checked={localSettings.notifications.taskOverdue}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, taskOverdue: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="warranty-expiring">Warranty Expiring</Label>
                    <p className="text-sm text-muted-foreground">Notify 7 days before warranties expire</p>
                  </div>
                  <Switch
                    id="warranty-expiring"
                    checked={localSettings.notifications.warrantyExpiring}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, warrantyExpiring: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="task-completed">Task Completed</Label>
                    <p className="text-sm text-muted-foreground">Notify when shared tasks are completed</p>
                  </div>
                  <Switch
                    id="task-completed"
                    checked={localSettings.notifications.taskCompleted}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, taskCompleted: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="task-created">New Tasks Created</Label>
                    <p className="text-sm text-muted-foreground">Notify when new tasks are added to shared items</p>
                  </div>
                  <Switch
                    id="task-created"
                    checked={localSettings.notifications.taskCreated}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, taskCreated: checked }
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => setChangePasswordOpen(true)}
                  className="w-full justify-start"
                >
                  Change Password
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setDeleteAccountOpen(true)}
                  className="w-full justify-start"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* Save Settings Button */}
            <Button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ChangePasswordDialog 
        open={changePasswordOpen} 
        onOpenChange={setChangePasswordOpen} 
      />
      <DeleteAccountDialog 
        open={deleteAccountOpen} 
        onOpenChange={setDeleteAccountOpen} 
      />
    </div>
  );
};

export default ProfileSettings;
