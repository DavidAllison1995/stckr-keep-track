
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

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

// Global state to track subscription status
let globalChannelRef: any = null;
let isSubscriptionActive = false;

export const useNotifications = () => {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID, returning empty notifications');
        return [];
      }
      
      console.log('Fetching notifications for user:', user.id);
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      console.log('Fetched notifications:', data);
      return data as Notification[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Backup polling every 30 seconds
  });

  // Log any query errors
  useEffect(() => {
    if (error) {
      console.error('Notifications query error:', error);
    }
  }, [error]);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('Marking notification as read:', notificationId);
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      console.log('Marking all notifications as read for user:', user.id);
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('Attempting to delete notification:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }
      
      console.log('Notification deleted successfully:', notificationId);
    },
    onSuccess: (_, notificationId) => {
      console.log('Delete mutation successful, invalidating queries for:', notificationId);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Delete mutation failed:', error);
    },
  });

  // Set up realtime subscription - FIXED: Global subscription management
  useEffect(() => {
    if (!user?.id) return;

    // Only create subscription if one doesn't exist
    if (!isSubscriptionActive) {
      console.log('Setting up realtime subscription for user:', user.id);
      
      const channel = supabase
        .channel(`user-notifications-${user.id}`)
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
            
            // Immediately invalidate and refetch notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });

      // Store the channel reference globally
      globalChannelRef = channel;
      isSubscriptionActive = true;
    }

    return () => {
      // Only cleanup when the last component unmounts
      // In practice, this will happen when the user logs out or app unmounts
      console.log('Component cleanup - subscription remains active');
    };
  }, [user?.id]);

  // Global cleanup when user changes or app unmounts
  useEffect(() => {
    return () => {
      if (globalChannelRef && isSubscriptionActive) {
        console.log('Cleaning up global realtime subscription');
        supabase.removeChannel(globalChannelRef);
        globalChannelRef = null;
        isSubscriptionActive = false;
      }
    };
  }, [user?.id]);

  // Calculate unread count from current notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  console.log('useNotifications - total notifications:', notifications.length, 'unread:', unreadCount);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
};
