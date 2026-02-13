
'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import React, { createContext, useContext } from 'react';
import { FirebaseErrorListener } from './FirebaseErrorListener';

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextType>({ app: null, auth: null, db: null });

export const FirebaseProvider = ({ app, auth, db, children }: { children: React.ReactNode; app: FirebaseApp, auth: Auth, db: Firestore }) => {
  return (
    <FirebaseContext.Provider value={{ app, auth, db }}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useContext(FirebaseContext).app;
export const useFirestore = () => useContext(FirebaseContext).db;
export const useAuth = () => useContext(FirebaseContext).auth;
