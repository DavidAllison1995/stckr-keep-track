
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Bell, 
  Shield, 
  Download, 
  Trash2,
  FileText,
  Database
} from 'lucide-react';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import { useToast } from '@/hooks/use-toast';
import DataManagement from './DataManagement';

const SettingsPage = () => {
  const { settings, updateSettings, isLoading } = useUserSettingsContext();
  const { toast } = useToast();

  const handleNotificationToggle = async (type: keyof typeof settings.notifications, value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [type]: value
      }
    };

    const result = await updateSettings(newSettings);
    
    if (result.success) {
      toast({
        title: 'Settings Updated',
        description: 'Notification preferences have been saved.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update settings',
        variant: 'destructive',
      });
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
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your app preferences and account settings</p>
      </div>

      <div className="space-y-8">
        {/* Notification Settings */}
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
                <Label>Task Created</Label>
                <p className="text-sm text-gray-500">
                  Get notified when new maintenance tasks are created
                </p>
              </div>
              <Switch
                checked={settings.notifications.taskCreated}
                onCheckedChange={(checked) => handleNotificationToggle('taskCreated', checked)}
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
                checked={settings.notifications.taskDueSoon}
                onCheckedChange={(checked) => handleNotificationToggle('taskDueSoon', checked)}
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
                checked={settings.notifications.taskDueToday}
                onCheckedChange={(checked) => handleNotificationToggle('taskDueToday', checked)}
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
                checked={settings.notifications.taskOverdue}
                onCheckedChange={(checked) => handleNotificationToggle('taskOverdue', checked)}
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
                checked={settings.notifications.taskUpdated}
                onCheckedChange={(checked) => handleNotificationToggle('taskUpdated', checked)}
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
                checked={settings.notifications.taskCompleted}
                onCheckedChange={(checked) => handleNotificationToggle('taskCompleted', checked)}
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
                checked={settings.notifications.recurringTaskReminder}
                onCheckedChange={(checked) => handleNotificationToggle('recurringTaskReminder', checked)}
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
                checked={settings.notifications.warrantyExpiring}
                onCheckedChange={(checked) => handleNotificationToggle('warrantyExpiring', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <DataManagement />
      </div>
    </div>
  );
};

export default SettingsPage;
