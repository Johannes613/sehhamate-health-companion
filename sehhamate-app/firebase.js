// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Expo/React Native, we need to use AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Debug: Check if environment variables are loaded
console.log('Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? 'loaded' : 'missing',
  authDomain: firebaseConfig.authDomain ? 'loaded' : 'missing',
  projectId: firebaseConfig.projectId ? 'loaded' : 'missing',
  storageBucket: firebaseConfig.storageBucket ? 'loaded' : 'missing'
});

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is incomplete! Check your .env file.');
  console.error('Missing variables:', {
    apiKey: !firebaseConfig.apiKey,
    projectId: !firebaseConfig.projectId
  });
  console.error('📖 See FIREBASE_SETUP.md for instructions on how to configure Firebase.');
  console.error('⚠️ The app will not work properly without Firebase configuration.');
}

// Initialize Firebase
let app, auth, db, storage;

try {
  console.log('🔥 Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');

  // Initialize Auth with AsyncStorage persistence for React Native
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('✅ Firebase Auth initialized with persistence');
  } catch (error) {
    console.warn('⚠️ Auth already initialized, getting existing instance');
    // If auth is already initialized, get the existing instance
    auth = getAuth(app);
    console.log('✅ Firebase Auth instance retrieved');
  }

  // Initialize Firestore
  db = getFirestore(app);
  console.log('✅ Firestore initialized successfully');

  // Initialize Storage
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized successfully');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.error('Check your Firebase configuration and network connection');
  
  // Create fallback objects to prevent app crashes
  auth = null;
  db = null;
  storage = null;
}

export { auth, db, storage };
export default app;

