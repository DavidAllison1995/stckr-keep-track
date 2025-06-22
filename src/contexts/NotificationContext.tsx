
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export interface Notification {
  id: string;
  user_id: string;
  type: 'task_due_soon' | 'task_overdue' | 'warranty_expiring' | 'task_completed' | 'task_created' | 'item_created';
  title: string;
  message?: string;
  task_id?: string;
  item_id?: string;
  created_at: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const fetchNotifications = async () => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    console.log('Fetching notifications for user:', user.id);
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      console.log('Fetched notifications:', data);
      // Type assertion to handle the database response
      setNotifications((data || []) as Notification[]);
    }
    setIsLoading(false);
  };

  // Set up real-time subscription - CENTRALIZED
  useEffect(() => {
    if (!user?.id || channelRef.current) return;

    console.log('Setting up centralized realtime subscription for user:', user.id);
    
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime notification event:', payload.eventType, payload);
          fetchNotifications(); // Refresh on any change
        }
      )
      .subscribe((status) => {
        console.log('Centralized subscription status:', status);
      });

    channelRef.current = channel;

    // Initial fetch
    fetchNotifications();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up centralized realtime subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id]);

  // Optional polling fallback every 30 seconds
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      console.log('Polling fallback: fetching notifications');
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    } else {
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    console.log('Marking all notifications as read for user:', user.id);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    } else {
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    }
  };

  const deleteNotification = async (notificationId: string) => {
    console.log('Deleting notification:', notificationId);
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Delete failed:', error.message);
    } else {
      console.log('Delete successful:', notificationId);
      // Optimistically update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
