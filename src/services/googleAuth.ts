import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

interface GoogleAuthResult {
  accessToken: string;
  idToken: string;
  email: string;
  name: string;
}

const GOOGLE_CONFIG = {
  clientId: '1004044323466-qskm9l5081ithk4572h677kdh2soi8ar.apps.googleusercontent.com',
  redirectUri: Capacitor.isNativePlatform() 
    ? 'com.stckr.keeptrack://oauth'
    : `${window.location.origin}/auth/callback`,
  scope: 'openid profile email',
};

export class GoogleAuthService {
  static async signIn(): Promise<GoogleAuthResult> {
    if (Capacitor.isNativePlatform()) {
      return this.signInNative();
    } else {
      return this.signInWeb();
    }
  }

  private static async signInNative(): Promise<GoogleAuthResult> {
    const authUrl = this.buildAuthUrl();
    
    const result = await Browser.open({
      url: authUrl,
      windowName: 'GoogleAuth',
    });

    // Handle the callback URL and extract tokens
    // This is a simplified implementation - in practice you'd need to handle the callback
    throw new Error('Native Google Auth implementation needs platform-specific callback handling');
  }

  private static async signInWeb(): Promise<GoogleAuthResult> {
    return new Promise((resolve, reject) => {
      // Create popup window for OAuth flow
      const authUrl = this.buildAuthUrl();
      const popup = window.open(
        authUrl,
        'googleAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication cancelled'));
        }
      }, 1000);

      // Listen for messages from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup?.close();
          resolve(event.data.result);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup?.close();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);
    });
  }

  private static buildAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: 'code',
      scope: GOOGLE_CONFIG.scope,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/oauth/authorize?${params.toString()}`;
  }

  static async signOut(): Promise<void> {
    // Implement sign out logic
    console.log('Google sign out');
  }
}