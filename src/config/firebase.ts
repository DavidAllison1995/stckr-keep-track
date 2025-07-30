import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD8gKgF9b8yI4K5yU7fM9q8X3jL2n1o0E9",
  authDomain: "stckr-keep-track.firebaseapp.com",
  projectId: "stckr-keep-track",
  storageBucket: "stckr-keep-track.appspot.com",
  messagingSenderId: "1004044323466",
  appId: "1:1004044323466:web:abc123def456",
  // Required for Android
  androidClientId: "1004044323466-android.apps.googleusercontent.com",
  iosClientId: "1004044323466-ios.apps.googleusercontent.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;