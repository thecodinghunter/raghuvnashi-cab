// Export all Firebase utilities and hooks
export * from './provider';
export * from './config';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

/**
 * Initialize Firebase with the provided config.
 * Returns Firebase services (app, firestore, auth, storage).
 */
export function initializeFirebase() {
  const firebaseApp = initializeApp(firebaseConfig);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);

  return {
    firebaseApp,
    firestore,
    auth,
    storage,
  };
}
