'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// This pattern ensures that Firebase is initialized only once on the client.
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function initializeFirebase() {
    if (getApps().length > 0) {
        app = getApp();
    } else {
        if (Object.values(firebaseConfig).some(value => !value)) {
            console.error("Firebase client configuration is incomplete. Check your .env.local file. App will not be initialized.");
            return;
        }
        app = initializeApp(firebaseConfig);
    }
    auth = getAuth(app);
    db = getFirestore(app);
}

export function getFirebaseServices() {
  if (!app) {
    initializeFirebase();
  }
  return { app, auth, db } as { app: FirebaseApp; auth: Auth; db: Firestore };
}
