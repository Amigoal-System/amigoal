'use client';

import { getFirebaseServices } from '@/lib/firebase/client';
import { FirebaseClientProvider } from './client-provider';
import { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useUser } from './auth/use-user';

// This file now acts as a central export point for all our client-side Firebase utilities.
// The actual initialization logic is handled by getFirebaseServices in /lib and the FirebaseClientProvider.

export {
  FirebaseProvider,
  FirebaseClientProvider,
  useCollection,
  useDoc,
  useUser,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  getFirebaseServices, // Exporting for direct use if needed, though hooks are preferred
};
