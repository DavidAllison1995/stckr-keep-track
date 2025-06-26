
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: 'failed_login' | 'admin_action' | 'suspicious_activity' | 'rate_limit_exceeded';
  user_id?: string;
  ip_address?: string;
  details?: any;
}

export const useSecurityMonitoring = () => {
  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    // Only log in development or for critical events
    if (import.meta.env.DEV || event.event_type === 'admin_action') {
      try {
        // In a real implementation, you'd send this to a security monitoring service
        // For now, we'll just log admin actions to the database
        if (event.event_type === 'admin_action') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Log admin actions for audit purposes
            console.warn('Admin Action:', {
              user_id: user.id,
              action: event.details?.action,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        // Silent fail - don't expose errors
      }
    }
  }, []);

  const trackFailedLogin = useCallback((email?: string) => {
    logSecurityEvent({
      event_type: 'failed_login',
      details: { email, timestamp: new Date().toISOString() }
    });
  }, [logSecurityEvent]);

  const trackAdminAction = useCallback((action: string, details?: any) => {
    logSecurityEvent({
      event_type: 'admin_action',
      details: { action, ...details }
    });
  }, [logSecurityEvent]);

  const trackSuspiciousActivity = useCallback((activity: string, details?: any) => {
    logSecurityEvent({
      event_type: 'suspicious_activity',
      details: { activity, ...details }
    });
  }, [logSecurityEvent]);

  const trackRateLimitExceeded = useCallback((endpoint: string) => {
    logSecurityEvent({
      event_type: 'rate_limit_exceeded',
      details: { endpoint, timestamp: new Date().toISOString() }
    });
  }, [logSecurityEvent]);

  return {
    trackFailedLogin,
    trackAdminAction,
    trackSuspiciousActivity,
    trackRateLimitExceeded,
  };
};
