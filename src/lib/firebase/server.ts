
// IMPORTANT: This file should only be used on the server, as it contains sensitive credentials.
'use server';

import admin from 'firebase-admin';

// This file is the single source of truth for Firebase Admin SDK initialization.
// It uses a lazy initialization pattern to ensure it's only initialized once per server instance.

let app: admin.app.App | null = null;
let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;
let storage: admin.storage.Storage | null = null;
let initPromise: Promise<void> | null = null;

async function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    if (!app) {
      app = admin.app();
      db = admin.firestore();
      auth = admin.auth();
      storage = admin.storage();
    }
    return;
  }
  
  const serviceAccountKeyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKeyBase64) {
    console.error("\n[Amigoal Firebase] ❌ FATAL: FIREBASE_SERVICE_ACCOUNT_KEY is not set in your environment. The application cannot connect to Firebase services on the server.");
    console.error("[Amigoal Firebase] 💡 Please ensure the variable is present in your `.env.local` file and is Base64 encoded. See FEHLERANALYSE.md for help.\n");
    return; // Stop initialization
  }

  try {
    const serviceAccountJson = Buffer.from(serviceAccountKeyBase64, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    
    db = admin.firestore();
    auth = admin.auth();
    storage = admin.storage();

    console.log(`[Amigoal Firebase] ✅ Admin SDK initialized successfully.`);
  } catch (error: any) {
    console.error("\n[Amigoal Firebase] ❌ FATAL: Firebase Admin SDK initialization failed.", error.message);
    console.error("[Amigoal Firebase] 💡 This usually means the FIREBASE_SERVICE_ACCOUNT_KEY in your .env.local is not a valid, single-line JSON string. Please verify its content. See FEHLERANALYSE.md for help.\n");
    // Set to null to indicate failure
    app = null;
    db = null;
    auth = null;
    storage = null;
  }
}

// Ensures initialization is only attempted once.
function ensureInitialized() {
  if (!initPromise) {
    initPromise = initializeFirebaseAdmin();
  }
  return initPromise;
}

export async function getDb() {
  await ensureInitialized();
  if (!db) {
    // This provides a more graceful failure instead of crashing the server if init fails.
    console.error("[Amigoal Firebase] Firestore service is not available due to initialization failure.");
    return null;
  }
  return db;
}

export async function getAuth() {
  await ensureInitialized();
   if (!auth) {
    console.error("[Amigoal Firebase] Auth service is not available due to initialization failure.");
    return null;
  }
  return auth;
}

export async function getStorage() {
  await ensureInitialized();
   if (!storage) {
    console.error("[Amigoal Firebase] Storage service is not available due to initialization failure.");
    return null;
  }
  return storage;
}
