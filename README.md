# STCKR - Keep Track

A comprehensive item tracking and maintenance management application built with React, Capacitor, and Supabase.

## Features

- Item tracking with QR codes
- Maintenance scheduling and reminders
- Photo and document storage
- User authentication with Google and Apple Sign-In
- Cross-platform support (Web, iOS, Android)

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- For mobile development:
  - iOS: Xcode (macOS only)
  - Android: Android Studio

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Google OAuth Configuration

For Google Sign-In to work, you need to configure OAuth credentials:

#### Web Application
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:8080`, your production domain
   - Authorized redirect URIs: Your Supabase auth callback URL

#### Mobile Applications
The app now uses Supabase OAuth with `@capacitor/browser` for cross-platform compatibility with Capacitor 7.

1. For iOS:
   - Configure URL schemes in `ios/App/App/Info.plist`:
     ```xml
     <key>CFBundleURLTypes</key>
     <array>
       <dict>
         <key>CFBundleURLName</key>
         <string>com.stckr.keeptrack</string>
         <key>CFBundleURLSchemes</key>
         <array>
           <string>com.stckr.keeptrack</string>
         </array>
       </dict>
     </array>
     ```

2. For Android:
   - Add intent filter in `android/app/src/main/AndroidManifest.xml`:
     ```xml
     <intent-filter android:autoVerify="true">
       <action android:name="android.intent.action.VIEW" />
       <category android:name="android.intent.category.DEFAULT" />
       <category android:name="android.intent.category.BROWSABLE" />
       <data android:scheme="com.stckr.keeptrack" />
     </intent-filter>
     ```

#### Required Configuration

Set up the following in your Supabase project:
- Google OAuth provider with your client ID and secret
- Authorized redirect URLs including your app domains

### Mobile Development

This app uses Capacitor 7 for mobile deployment:

1. Build the web app:
   ```bash
   npm run build
   ```

2. Sync with native platforms:
   ```bash
   npx cap sync
   ```

3. Run on device/emulator:
   ```bash
   # iOS
   npx cap run ios
   
   # Android
   npx cap run android
   ```

### Authentication

The app supports multiple authentication methods:
- Email/password
- Google Sign-In (OAuth2 flow via Supabase)
- Apple Sign-In (OAuth2 flow via Supabase)

**Authentication**: OAuth flows use Supabase's built-in OAuth providers with `@capacitor/browser` for stable cross-platform compatibility.

### Environment Setup

Configure your Supabase project with:
- Database tables for items, maintenance, profiles
- Storage buckets for photos and documents
- Edge functions for QR code generation and external API integration
- Row Level Security policies for data protection

## Deployment

### Web
Build and deploy the `dist` folder to your hosting provider.

### Mobile
Follow the Capacitor deployment guides for iOS App Store and Google Play Store.

After deployment, run `npx cap sync` to sync any changes to native platforms.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private project - all rights reserved.