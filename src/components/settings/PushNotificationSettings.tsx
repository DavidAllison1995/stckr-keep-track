
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, AlertCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationSettings = () => {
  const { isSupported, token, isRegistered, sendTestNotification } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Push notifications are only available in the mobile app</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Status</h4>
            <p className="text-sm text-gray-600">
              {isRegistered ? 'Registered for push notifications' : 'Not registered'}
            </p>
          </div>
          <Badge variant={isRegistered ? 'default' : 'secondary'}>
            {isRegistered ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {token && (
          <div>
            <h4 className="font-medium mb-2">Device Token</h4>
            <p className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded break-all">
              {token.substring(0, 50)}...
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Task Reminders</h4>
            <p className="text-sm text-gray-600">Get notified about due tasks</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Maintenance Alerts</h4>
            <p className="text-sm text-gray-600">Receive maintenance reminders</p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Warranty Expiration</h4>
            <p className="text-sm text-gray-600">Get notified before warranties expire</p>
          </div>
          <Switch defaultChecked />
        </div>

        {isRegistered && (
          <Button onClick={sendTestNotification} variant="outline" className="w-full">
            Send Test Notification
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationSettings;
