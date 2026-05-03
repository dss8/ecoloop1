/**
 * Firebase v9+ modular client SDK initialisation.
 *
 * If the user has not yet provided their Firebase web config (env vars
 * VITE_FIREBASE_*), we run in a "not-configured" mode where helpers
 * throw friendly errors so the rest of the app keeps rendering.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, browserLocalPersistence, setPersistence } from "firebase/auth";

const env = import.meta.env as unknown as Record<string, string | undefined>;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId,
);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

if (isFirebaseConfigured) {
  _app = getApps()[0] ?? initializeApp(firebaseConfig as Record<string, string>);
  _auth = getAuth(_app);
  setPersistence(_auth, browserLocalPersistence).catch((err) => {
    console.warn("[firebase] persistence error", err);
  });
} else {
  console.warn(
    "[firebase] Not configured. Set VITE_FIREBASE_* env vars in /app/frontend/.env to enable real auth.",
  );
}

export const firebaseApp: FirebaseApp | null = _app;
export const firebaseAuth: Auth | null = _auth;

export function requireAuth(): Auth {
  if (!_auth) {
    throw new Error(
      "Firebase is not configured. Add VITE_FIREBASE_* env vars and restart the frontend.",
    );
  }
  return _auth;
}
