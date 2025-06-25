
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { useSupabaseAuth } from './useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setIsSupported(true);
      initializePushNotifications();
    }
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permission to use push notifications
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        setIsRegistered(true);
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      setToken(token.value);
      savePushToken(token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received: ', notification);
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
    });
  };

  const savePushToken = async (pushToken: string) => {
    if (!user?.id) return;

    try {
      // Save the push token to user settings or a separate table
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          push_token: pushToken
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!token) {
      console.log('No push token available');
      return;
    }

    try {
      // This would typically be handled by your backend
      console.log('Test notification would be sent to token:', token);
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return {
    isSupported,
    token,
    isRegistered,
    sendTestNotification,
  };
};
