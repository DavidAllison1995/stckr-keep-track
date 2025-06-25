
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import { Bell, User, Database, Smartphone, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DataManagement from './DataManagement';
import PushNotificationSettings from './PushNotificationSettings';

const SettingsPage = () => {
  const { settings, updateSettings, isLoading } = useUserSettingsContext();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleNotificationToggle = async (key: keyof typeof settings.notifications, value: boolean) => {
    setIsSaving(true);
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    };

    const result = await updateSettings(newSettings);
    
    if (result.success) {
      toast({
        title: 'Settings updated',
        description: 'Your notification preferences have been saved.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update settings',
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Push Notifications Section */}
      <PushNotificationSettings />

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskDueSoon">Tasks Due Soon</Label>
                <p className="text-sm text-gray-600">Get notified 3 days before tasks are due</p>
              </div>
              <Switch
                id="taskDueSoon"
                checked={settings.notifications.taskDueSoon}
                onCheckedChange={(checked) => handleNotificationToggle('taskDueSoon', checked)}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskDueToday">Tasks Due Today</Label>
                <p className="text-sm text-gray-600">Daily reminder for tasks due today</p>
              </div>
              <Switch
                id="taskDueToday"
                checked={settings.notifications.taskDueToday}
                onCheckedChange={(checked) => handleNotificationToggle('taskDueToday', checked)}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskOverdue">Overdue Tasks</Label>
                <p className="text-sm text-gray-600">Get notified about overdue tasks</p>
              </div>
              <Switch
                id="taskOverdue"
                checked={settings.notifications.taskOverdue}
                onCheckedChange={(checked) => handleNotificationToggle('taskOverdue', checked)}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="warrantyExpiring">Warranty Expiring</Label>
                <p className="text-sm text-gray-600">Get notified when warranties are about to expire</p>
              </div>
              <Switch
                id="warrantyExpiring"
                checked={settings.notifications.warrantyExpiring}
                onCheckedChange={(checked) => handleNotificationToggle('warrantyExpiring', checked)}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskCompleted">Task Completed</Label>
                <p className="text-sm text-gray-600">Get notified when tasks are completed</p>
              </div>
              <Switch
                id="taskCompleted"
                checked={settings.notifications.taskCompleted}
                onCheckedChange={(checked) => handleNotificationToggle('taskCompleted', checked)}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskCreated">Task Created</Label>
                <p className="text-sm text-gray-600">Get notified when new tasks are created</p>
              </div>
              <Switch
                id="taskCreated"
                checked={settings.notifications.taskCreated}
                onCheckedChange={(checked) => handleNotificationToggle('taskCreated', checked)}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskUpdated">Task Updated</Label>
                <p className="text-sm text-gray-600">Get notified when tasks are modified</p>
              </div>
              <Switch
                id="taskUpdated"
                checked={settings.notifications.taskUpdated}
                onCheckedChange={(checked) => handleNotificationToggle('taskUpdated', checked)}
                disabled={isSaving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="recurringTaskReminder">Recurring Task Reminders</Label>
                <p className="text-sm text-gray-600">Get notified about upcoming recurring tasks</p>
              </div>
              <Switch
                id="recurringTaskReminder"
                checked={settings.notifications.recurringTaskReminder}
                onCheckedChange={(checked) => handleNotificationToggle('recurringTaskReminder', checked)}
                disabled={isSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataManagement />
        </CardContent>
      </Card>

      {/* Mobile App Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Mobile App
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              To enable push notifications and get the full mobile experience, 
              export this project to build the native mobile app.
            </p>
            <div className="flex gap-2 justify-center">
              <Badge variant="outline">iOS</Badge>
              <Badge variant="outline">Android</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
