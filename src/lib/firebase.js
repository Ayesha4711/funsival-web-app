import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);

// Returns the messaging instance only in browser environments that support it
export async function getMessagingInstance() {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
}

// Sign Firebase in with the custom token returned by POST /chats/token
export async function signInFirebase(customToken) {
  try {
    await signInWithCustomToken(firebaseAuth, customToken);
  } catch {
    // Non-fatal — real-time Firestore listener won't work but push still will
  }
}

// Register service worker then get the FCM token
export async function requestNotificationPermission() {
  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  let swReg;
  try {
    swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  } catch {
    // Fallback: use existing registration if present
    swReg = (await navigator.serviceWorker.getRegistrations())[0];
  }

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  return token || null;
}

// Call this while the app is open to handle foreground messages
export async function onForegroundMessage(callback) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

export default app;
