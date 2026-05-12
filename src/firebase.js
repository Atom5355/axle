import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Trim defensively: CI secret tooling can introduce stray CR/LF/whitespace,
// and the Firebase SDK fails hard on malformed URLs (e.g. trailing newline).
const clean = (v) => (typeof v === 'string' ? v.trim() : v);

const firebaseConfig = {
  apiKey: clean(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  databaseURL: clean(import.meta.env.VITE_FIREBASE_DATABASE_URL),
  projectId: clean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(import.meta.env.VITE_FIREBASE_APP_ID),
};

const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length > 0) {
  // Surface a helpful message early to make local setup obvious.
  // eslint-disable-next-line no-console
  console.warn(
    `Firebase is not fully configured. Missing env vars for: ${missing.join(
      ', '
    )}. Copy .env.example to .env.local and fill the values from your Firebase project.`
  );
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
