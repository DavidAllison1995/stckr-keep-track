# WebView OAuth Authentication Setup

This app now uses an in-app WebView modal for Google and Apple OAuth authentication instead of unstable native plugins.

## How It Works

### Native Apps (iOS/Android)
- OAuth flows open in a Browser modal within the app
- Users never leave the app during authentication  
- Deep linking handles the OAuth callback
- URL scheme: `com.stckr.keeptrack://callback`

### Web Apps
- Falls back to standard Supabase OAuth with iframe modal
- Seamless user experience across platforms

## Components

### AuthModal (`src/components/auth/AuthModal.tsx`)
- Full-screen modal containing WebView/iframe for OAuth
- Handles both Google and Apple authentication flows
- Monitors navigation state for OAuth callbacks

### useWebViewAuth (`src/hooks/useWebViewAuth.tsx`)  
- Manages WebView OAuth state and flow
- Parses OAuth callback URLs for tokens
- Provides error handling and success notifications

### Updated useSupabaseAuth
- Delegates OAuth to WebView modal instead of native plugins
- Maintains existing API for components
- Adds modal state management

## Deep Linking

The app handles OAuth callbacks via:
- URL scheme: `com.stckr.keeptrack://callback`
- Deep link handler updated to work with WebView flow
- No external browser sessions

## Benefits

✅ Stable authentication without plugin dependencies  
✅ Users never leave the app  
✅ Works on both native and web platforms  
✅ Handles OAuth errors gracefully  
✅ Maintains existing component APIs  

## Testing

1. **Google OAuth**: Tap "Sign in with Google" → WebView modal → complete login → modal closes
2. **Apple OAuth**: Tap "Sign in with Apple" → WebView modal → complete login → modal closes  
3. **Web fallback**: Standard OAuth flow with iframe on web platforms

## Cleanup

Removed unstable native plugins:
- `@codetrix-studio/capacitor-google-auth` 
- `@capacitor-community/apple-sign-in`

Added stable dependency:
- `@capacitor/browser` for WebView management