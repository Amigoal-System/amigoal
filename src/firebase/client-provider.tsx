'use client';
import { useState, useEffect } from 'react';
import { getFirebaseServices } from '@/lib/firebase/client';
import { FirebaseProvider } from './provider';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface FirebaseInstances {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
}

/**
 * Ensures that Firebase is initialized only once on the client.
 */
export const FirebaseClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebase, setFirebase] = useState<FirebaseInstances | null>(null);

  useEffect(() => {
    // Firebase should only be initialized on the client.
    const instances = getFirebaseServices();
    if (instances?.app) {
      setFirebase(instances);
    }
  }, []);

  if (!firebase) {
    // Display a loading indicator while Firebase initializes.
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
        </div>
    );
  }
  
  return (
    <FirebaseProvider app={firebase.app} auth={firebase.auth} db={firebase.db}>
        {children}
    </FirebaseProvider>
  );
};
