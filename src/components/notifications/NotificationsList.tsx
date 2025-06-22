
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotificationContext, Notification } from '@/contexts/NotificationContext';
import { Calendar, Package, Clock, AlertTriangle, CheckCircle, Plus, X } from 'lucide-react';

interface NotificationsListProps {
  onNotificationClick?: () => void;
}

const NotificationsList = ({ onNotificationClick }: NotificationsListProps) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoading
  } = useNotificationContext();

  console.log('NotificationsList render - notifications:', notifications, 'unreadCount:', unreadCount);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task_due_soon':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'task_overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warranty_expiring':
        return <Package className="w-4 h-4 text-orange-600" />;
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'task_created':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'item_created':
        return <Plus className="w-4 h-4 text-purple-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to the relevant page
    if (notification.task_id && notification.item_id) {
      navigate(`/items/${notification.item_id}?tab=maintenance&highlight=${notification.task_id}`);
    } else if (notification.item_id) {
      navigate(`/items/${notification.item_id}`);
    } else if (notification.task_id) {
      navigate('/maintenance');
    }

    onNotificationClick?.();
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Delete button clicked for notification ID:', notificationId);
    
    try {
      await deleteNotification(notificationId);
      console.log('Delete operation completed successfully');
    } catch (error) {
      console.error('Delete operation failed:', error);
    }
  };

  const handleMarkAllAsRead = () => {
    console.log('Marking all notifications as read');
    markAllAsRead();
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Notifications</CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      
      {notifications.length === 0 ? (
        <CardContent className="pb-4">
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        </CardContent>
      ) : (
        <ScrollArea className="h-96">
          <CardContent className="pt-0 space-y-1">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-opacity"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          type="button"
                          title="Delete notification"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    
                    {notification.message && (
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                {index < notifications.length - 1 && <Separator className="my-1" />}
              </div>
            ))}
          </CardContent>
        </ScrollArea>
      )}
    </Card>
  );
};

export default NotificationsList;
