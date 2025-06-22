
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useUserSettingsContext } from '@/contexts/UserSettingsContext';
import DataManagement from './DataManagement';
import NotificationTestPanel from '@/components/notifications/NotificationTestPanel';
import { Bell, Database, TestTube, Save, User } from 'lucide-react';

const SettingsPage = () => {
  const { settings, updateSettings, isLoading } = useUserSettingsContext();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  const handleNotificationChange = (key: keyof typeof settings.notifications, value: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateSettings(localSettings);
      if (result.success) {
        console.log('Settings saved successfully');
      } else {
        console.error('Failed to save settings:', result.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettings);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="px-4 pt-4 pb-20">
          <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
            <div className="p-6 pb-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="px-4 pt-4 pb-20">
        <div className="bg-white rounded-t-3xl shadow-lg min-h-screen">
          <div className="p-6 pb-8 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                Settings
              </h1>
              <p className="text-gray-600 mt-1">Manage your preferences and notifications</p>
            </div>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Due Soon</Label>
                    <p className="text-sm text-gray-600">Get notified when tasks are due within 3 days</p>
                  </div>
                  <Switch
                    checked={localSettings.notifications.taskDueSoon}
                    onCheckedChange={(checked) => handleNotificationChange('taskDueSoon', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Overdue</Label>
                    <p className="text-sm text-gray-600">Get notified when tasks are past their due date</p>
                  </div>
                  <Switch
                    checked={localSettings.notifications.taskOverdue}
                    onCheckedChange={(checked) => handleNotificationChange('taskOverdue', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Warranty Expiring</Label>
                    <p className="text-sm text-gray-600">Get notified when item warranties are expiring</p>
                  </div>
                  <Switch
                    checked={localSettings.notifications.warrantyExpiring}
                    onCheckedChange={(checked) => handleNotificationChange('warrantyExpiring', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Completed</Label>
                    <p className="text-sm text-gray-600">Get notified when tasks are marked as complete</p>
                  </div>
                  <Switch
                    checked={localSettings.notifications.taskCompleted}
                    onCheckedChange={(checked) => handleNotificationChange('taskCompleted', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Created</Label>
                    <p className="text-sm text-gray-600">Get notified when new tasks are created</p>
                  </div>
                  <Switch
                    checked={localSettings.notifications.taskCreated}
                    onCheckedChange={(checked) => handleNotificationChange('taskCreated', checked)}
                  />
                </div>

                {hasChanges && (
                  <div className="pt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Development Test Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Development Tools
                  <Badge variant="secondary">Dev Only</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowTestPanel(!showTestPanel)}
                    className="w-full"
                  >
                    {showTestPanel ? 'Hide' : 'Show'} Notification Test Panel
                  </Button>
                  
                  {showTestPanel && (
                    <div className="mt-4">
                      <NotificationTestPanel />
                    </div>
                  )}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
