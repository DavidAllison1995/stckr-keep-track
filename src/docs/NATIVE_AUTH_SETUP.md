# Native Authentication Setup Guide

This guide walks you through setting up native Google and Apple authentication for your mobile app.

## Current Implementation

✅ **Completed:**
- Native Google Sign-In plugin installed (@codetrix-studio/capacitor-google-auth)
- Native Apple Sign-In plugin installed (@capacitor-community/apple-sign-in)
- In-app authentication flows implemented
- Proper token handling with Supabase
- Fallback to browser OAuth on web platforms
- Test pages available at `/native-auth-test`

## Setup Steps

### 1. Sync Native Plugins
```bash
npx cap sync
```

### 2. iOS Configuration

#### Xcode Setup:
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Add "Sign In with Apple" capability
5. Ensure proper bundle identifier matches: `com.stckr.keeptrack`

#### Info.plist Configuration:
The following configurations are already in your `capacitor.config.ts`:
```typescript
ios: {
  infoPlist: {
    // Apple Sign-In configuration
    CFBundleURLTypes: [
      {
        CFBundleURLName: 'STCKR OAuth',
        CFBundleURLSchemes: ['stckr', 'com.stckr.keeptrack']
      }
    ]
  }
}
```

### 3. Android Configuration

#### Google Services Setup:
1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory
3. Ensure the package name matches: `com.stckr.keeptrack`

#### Build Configuration:
The following configurations are already set:
- Google Auth plugin dependency in `android/app/build.gradle`
- Server client ID configuration in `strings.xml`

### 4. Testing the Setup

#### Access Test Pages:
- Camera tests: `/camera-test`
- Native auth tests: `/native-auth-test`

#### Expected Behavior:

**✅ Correct (Native In-App):**
- Google Sign-In opens within the app
- Apple Sign-In uses native iOS dialog
- No browser redirects
- Seamless return to app after authentication
- Proper Supabase session establishment

**❌ Incorrect (Browser Redirect):**
- External browser opens for authentication
- User redirected outside the app
- Manual return to app required

### 5. Troubleshooting

#### Common Issues:

1. **"Google Auth not available"**
   - Ensure `google-services.json` is in place
   - Run `npx cap sync` after adding the file
   - Check server client ID configuration

2. **"Apple Sign-In not available"**
   - iOS device/simulator only
   - Ensure Apple Sign-In capability is added in Xcode
   - Check bundle identifier matches

3. **Browser redirect still happens**
   - Plugin may not be properly synced
   - Check platform detection with `/native-auth-test`
   - Verify plugin initialization

#### Debug Commands:
```bash
# Clean and sync
npx cap clean ios
npx cap clean android
npx cap sync

# Check plugin status
npx cap ls

# View native logs
npx cap run ios --livereload
npx cap run android --livereload
```

### 6. Production Considerations

#### Apple App Store:
- Apple Sign-In capability must be properly configured
- Privacy policy must mention Apple Sign-In usage
- App review may test authentication flows

#### Google Play Store:
- Google Services configuration must be production-ready
- OAuth consent screen must be properly configured
- App signing configuration should match

### 7. Security Notes

- ID tokens are properly validated by Supabase
- Native plugins handle secure token storage
- No sensitive credentials stored in client code
- Proper logout clears both Supabase and native sessions

## Implementation Details

### Google Sign-In Flow:
1. Initialize Google Auth plugin with web client ID
2. Call native `GoogleAuth.signIn()`
3. Extract ID token from result
4. Pass token to Supabase `signInWithIdToken()`
5. Establish authenticated session

### Apple Sign-In Flow:
1. Check iOS platform availability
2. Call native `SignInWithApple.authorize()`
3. Extract identity token from result
4. Pass token to Supabase `signInWithIdToken()`
5. Establish authenticated session

### Fallback Handling:
- Web platforms automatically use browser OAuth
- Error states gracefully handled with user feedback
- Cancellation doesn't show error messages

This setup provides a seamless native authentication experience while maintaining compatibility with web platforms.