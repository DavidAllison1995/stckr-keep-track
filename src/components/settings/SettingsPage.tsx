
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useUserSettings } from '@/hooks/useUserSettings';
import DataManagement from './DataManagement';

const SettingsPage = () => {
  const { settings, updateSettings, isLoading } = useUserSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const { toast } = useToast();

  const handleSave = async () => {
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

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const handleCalendarChange = (key: keyof typeof settings.calendar, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        [key]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-300">Customize your app preferences</p>
            </div>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label>Theme</Label>
                <RadioGroup
                  value={localSettings.theme}
                  onValueChange={(value) => 
                    setLocalSettings(prev => ({ ...prev, theme: value as 'light' | 'dark' | 'system' }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">System</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notifications Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-due-soon">Tasks Due Soon</Label>
                  <Switch
                    id="task-due-soon"
                    checked={localSettings.notifications.taskDueSoon}
                    onCheckedChange={(checked) => handleNotificationChange('taskDueSoon', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-overdue">Overdue Tasks</Label>
                  <Switch
                    id="task-overdue"
                    checked={localSettings.notifications.taskOverdue}
                    onCheckedChange={(checked) => handleNotificationChange('taskOverdue', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-upcoming">Upcoming Tasks</Label>
                  <Switch
                    id="task-upcoming"
                    checked={localSettings.notifications.taskUpcoming}
                    onCheckedChange={(checked) => handleNotificationChange('taskUpcoming', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Calendar Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Default View</Label>
                  <RadioGroup
                    value={localSettings.calendar.defaultView}
                    onValueChange={(value) => handleCalendarChange('defaultView', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="week" id="week" />
                      <Label htmlFor="week">Week View</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="month" id="month" />
                      <Label htmlFor="month">Month View</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-3">
                  <Label>Date Format</Label>
                  <RadioGroup
                    value={localSettings.calendar.dateFormat}
                    onValueChange={(value) => handleCalendarChange('dateFormat', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MM/dd/yyyy" id="us-format" />
                      <Label htmlFor="us-format">MM/dd/yyyy (US)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dd/MM/yyyy" id="intl-format" />
                      <Label htmlFor="intl-format">dd/MM/yyyy (International)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Enable Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications even when the app is closed
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={localSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <DataManagement />

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
