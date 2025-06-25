
import { useEffect } from 'react';

// Hook to set security headers and implement security measures
export const useSecurityHeaders = () => {
  useEffect(() => {
    // Content Security Policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://cudftlquaydissmvqjmv.supabase.co wss://cudftlquaydissmvqjmv.supabase.co;";
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

    // Referrer Policy
    const referrer = document.createElement('meta');
    referrer.name = 'referrer';
    referrer.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrer);

    return () => {
      // Cleanup meta tags on unmount
      document.head.removeChild(meta);
      document.head.removeChild(xContentType);
      document.head.removeChild(xFrame);
      document.head.removeChild(referrer);
    };
  }, []);

  // Rate limiting state (simple client-side implementation)
  const createRateLimiter = (maxRequests: number, windowMs: number) => {
    const requests: number[] = [];
    
    return () => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Remove old requests outside the window
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }
      
      // Check if we're over the limit
      if (requests.length >= maxRequests) {
        return false; // Rate limited
      }
      
      // Add current request
      requests.push(now);
      return true; // Allow request
    };
  };

  return {
    createRateLimiter,
  };
};
