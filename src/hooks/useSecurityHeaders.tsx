
import { useEffect } from 'react';

// Hook to set security headers and implement security measures
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy - more restrictive for production
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.qrserver.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://cudftlquaydissmvqjmv.supabase.co wss://cudftlquaydissmvqjmv.supabase.co https://api.qrserver.com; frame-ancestors 'none';";
    document.head.appendChild(meta);

    // X-Content-Type-Options
    const xContentType = document.createElement('meta');
    xContentType.httpEquiv = 'X-Content-Type-Options';
    xContentType.content = 'nosniff';
    document.head.appendChild(xContentType);

    // X-Frame-Options
    const xFrame = document.createElement('meta');
    xFrame.httpEquiv = 'X-Frame-Options';
    xFrame.content = 'DENY';
    document.head.appendChild(xFrame);

    // X-XSS-Protection
    const xssProtection = document.createElement('meta');
    xssProtection.httpEquiv = 'X-XSS-Protection';
    xssProtection.content = '1; mode=block';
    document.head.appendChild(xssProtection);

    // Referrer Policy
    const referrer = document.createElement('meta');
    referrer.name = 'referrer';
    referrer.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrer);

    // Permissions Policy
    const permissions = document.createElement('meta');
    permissions.httpEquiv = 'Permissions-Policy';
    permissions.content = 'camera=(), microphone=(), geolocation=(), payment=()';
    document.head.appendChild(permissions);

    return () => {
      // Cleanup meta tags on unmount
      document.head.removeChild(meta);
      document.head.removeChild(xContentType);
      document.head.removeChild(xFrame);
      document.head.removeChild(xssProtection);
      document.head.removeChild(referrer);
      document.head.removeChild(permissions);
    };
  }, []);

  // Enhanced rate limiting with exponential backoff
  const createRateLimiter = (maxRequests: number, windowMs: number) => {
    const requests: { timestamp: number; attempts: number }[] = [];
    let consecutiveFailures = 0;
    
    return (isSuccess: boolean = true) => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Track success/failure for exponential backoff
      if (!isSuccess) {
        consecutiveFailures++;
      } else {
        consecutiveFailures = 0;
      }
      
      // Calculate backoff delay based on consecutive failures
      const backoffDelay = Math.min(1000 * Math.pow(2, consecutiveFailures), 30000); // Max 30s
      
      // Remove old requests outside the window
      while (requests.length > 0 && requests[0].timestamp < windowStart) {
        requests.shift();
      }
      
      // Check if we're over the limit or in backoff period
      if (requests.length >= maxRequests) {
        return { 
          allowed: false, 
          retryAfter: Math.max(backoffDelay, windowMs - (now - requests[0].timestamp)) 
        };
      }
      
      // Add current request
      requests.push({ timestamp: now, attempts: consecutiveFailures });
      return { allowed: true, retryAfter: 0 };
    };
  };

  // Security event logger (only logs in development)
  const logSecurityEvent = (event: string, details?: any) => {
    if (import.meta.env.DEV) {
      console.warn(`Security Event: ${event}`, details);
    }
  };

  return {
    createRateLimiter,
    logSecurityEvent,
  };
};
