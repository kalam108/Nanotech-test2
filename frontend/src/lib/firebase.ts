import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

// ============================================================================
// Firebase Project Configuration
// Project: nanotech-203fe
// App ID:  1:442504275051:web:a3b649aaab54946bf8bd2e
// ============================================================================

export const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    (typeof process !== 'undefined' && process.env?.VITE_FIREBASE_API_KEY) ||
    '',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'nanotech-203fe.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || 'nanotech-203fe',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'nanotech-203fe.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '442504275051',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || '1:442504275051:web:a3b649aaab54946bf8bd2e',
};

// Check if Firebase Web API Key is present
export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.trim().length > 5);
};

// Safe Singleton Instances
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.trim().length > 5) {
    appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({
      prompt: 'select_account',
    });
  }
} catch (e) {
  console.warn('[Firebase Init Note]:', e);
}

export const app: FirebaseApp | null = appInstance;
export const auth: Auth | null = authInstance;
export const db: Firestore | null = dbInstance;
export const googleProvider: GoogleAuthProvider | null = googleProviderInstance;

export const SUPER_ADMIN_EMAIL = 'kalamchy88@gmail.com';

// ============================================================================
// Firebase Connection Diagnostic Function
// ============================================================================

export interface FirebaseConnectionStatus {
  connected: boolean;
  status: 'CONNECTED' | 'API_KEY_REQUIRED' | 'NETWORK_ERROR';
  projectId: string;
  appId: string;
  authDomain: string;
  hasApiKey: boolean;
  details: string;
}

/**
 * Checks connectivity to the nanotech-203fe Firebase project
 */
export async function checkFirebaseConnection(): Promise<FirebaseConnectionStatus> {
  const hasApiKey = isFirebaseConfigured();
  const projectId = firebaseConfig.projectId;
  const appId = firebaseConfig.appId;
  const authDomain = firebaseConfig.authDomain;

  if (!hasApiKey) {
    return {
      connected: false,
      status: 'API_KEY_REQUIRED',
      projectId,
      appId,
      authDomain,
      hasApiKey: false,
      details:
        'Firebase project ID (nanotech-203fe) and App ID are configured. To enable live operations, paste your Web API Key into VITE_FIREBASE_API_KEY in .env (Found in Firebase Console > Project Settings > General > Web Apps).',
    };
  }

  try {
    const res = await fetch(`https://${authDomain}/__/auth/handler`, { method: 'HEAD' });
    const isDomainReachable = res.status < 500;

    return {
      connected: isDomainReachable,
      status: isDomainReachable ? 'CONNECTED' : 'NETWORK_ERROR',
      projectId,
      appId,
      authDomain,
      hasApiKey: true,
      details: isDomainReachable
        ? `Successfully connected to Firebase (${projectId}) via ${authDomain}.`
        : `Auth Domain returned HTTP ${res.status}.`,
    };
  } catch (err: any) {
    return {
      connected: false,
      status: 'NETWORK_ERROR',
      projectId,
      appId,
      authDomain,
      hasApiKey: true,
      details: err?.message || 'Unable to connect to Firebase network endpoints.',
    };
  }
}

// ============================================================================
// Helper Functions: Authentication
// ============================================================================

export interface UserProfileData {
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  role: 'customer' | 'admin' | 'seller';
  phone?: string;
  location?: string;
  photoURL?: string;
  createdAt?: any;
  lastLoginAt?: any;
  isLiveSession?: boolean;
  source?: string;
}

/**
 * Register a new user with Email and Password in Firebase Auth,
 * sets display name, and writes initial user profile to Firestore.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<{ user: FirebaseUser; profile: UserProfileData }> {
  if (!authInstance || !dbInstance) {
    throw new Error(
      'Firebase API Key is missing. Please add VITE_FIREBASE_API_KEY in your .env file from Firebase Console > Project Settings.'
    );
  }

  const userCredential = await createUserWithEmailAndPassword(
    authInstance,
    email.trim(),
    password
  );
  const fbUser = userCredential.user;

  // Update Auth Profile Display Name
  if (fullName) {
    try {
      await updateProfile(fbUser, { displayName: fullName });
    } catch (err) {
      console.warn('[firebase-auth] updateProfile warning:', err);
    }
  }

  const isSuperAdmin =
    email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const role = isSuperAdmin ? 'admin' : 'customer';

  const profile: UserProfileData = {
    uid: fbUser.uid,
    email: fbUser.email || email.trim(),
    name: fullName || fbUser.email?.split('@')[0] || 'Customer',
    displayName: fullName || fbUser.email?.split('@')[0] || 'Customer',
    role,
    phone: phone || '',
    location: 'Nepal (Storefront)',
    photoURL: fbUser.photoURL || undefined,
    isLiveSession: true,
    source: 'Firebase Auth & Firestore',
  };

  // Write to Firestore `users` collection matching firestore.rules
  try {
    const userDocRef = doc(dbInstance, 'users', fbUser.uid);
    await setDoc(
      userDocRef,
      {
        uid: fbUser.uid,
        email: profile.email,
        displayName: profile.name,
        role: profile.role,
        phone: profile.phone || '',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Also mirror to `customers` collection for storefront and admin management
    const customerDocRef = doc(dbInstance, 'customers', fbUser.uid);
    await setDoc(
      customerDocRef,
      {
        uid: fbUser.uid,
        email: profile.email,
        name: profile.name,
        phone: profile.phone || '',
        location: profile.location || 'Nepal',
        status: 'active',
        ordersCount: 0,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[firestore] Syncing user profile note:', err);
  }

  return { user: fbUser, profile };
}

/**
 * Sign In existing user with Email and Password via Firebase Auth,
 * loads Firestore profile and updates lastLogin timestamp.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: FirebaseUser; profile: UserProfileData }> {
  if (!authInstance || !dbInstance) {
    throw new Error(
      'Firebase API Key is missing. Please add VITE_FIREBASE_API_KEY in your .env file from Firebase Console > Project Settings.'
    );
  }

  const userCredential = await signInWithEmailAndPassword(
    authInstance,
    email.trim(),
    password
  );
  const fbUser = userCredential.user;

  const isSuperAdmin =
    email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  let profile: UserProfileData = {
    uid: fbUser.uid,
    email: fbUser.email || email.trim(),
    name: fbUser.displayName || email.split('@')[0],
    displayName: fbUser.displayName || email.split('@')[0],
    role: isSuperAdmin ? 'admin' : 'customer',
    phone: fbUser.phoneNumber || '',
    photoURL: fbUser.photoURL || undefined,
    isLiveSession: true,
    source: 'Firebase Auth & Firestore',
  };

  // Fetch Firestore user doc if present
  try {
    const userDocRef = doc(dbInstance, 'users', fbUser.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      profile = {
        ...profile,
        name: data.displayName || profile.name,
        role: isSuperAdmin ? 'admin' : data.role || profile.role,
        phone: data.phone || profile.phone,
      };

      await setDoc(
        userDocRef,
        { lastLoginAt: serverTimestamp() },
        { merge: true }
      );
    } else {
      await setDoc(
        userDocRef,
        {
          uid: fbUser.uid,
          email: profile.email,
          displayName: profile.name,
          role: profile.role,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('[firestore] load profile warning:', err);
  }

  return { user: fbUser, profile };
}

/**
 * Sign In / Sign Up with Google OAuth popup via Firebase Auth,
 * automatically extracts Google profile and synchronizes to Firestore.
 */
export async function signInWithGoogle(): Promise<{
  user: FirebaseUser;
  profile: UserProfileData;
}> {
  if (!authInstance || !googleProviderInstance) {
    throw new Error(
      'Firebase API Key is missing. Please add VITE_FIREBASE_API_KEY in your .env file from Firebase Console > Project Settings.'
    );
  }

  try {
    const result = await signInWithPopup(authInstance, googleProviderInstance);
    const fbUser = result.user;

    const email = fbUser.email || '';
    const isSuperAdmin =
      email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const role = isSuperAdmin ? 'admin' : 'customer';

    const profile: UserProfileData = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      name: fbUser.displayName || email.split('@')[0] || 'Google User',
      displayName: fbUser.displayName || email.split('@')[0] || 'Google User',
      role,
      photoURL: fbUser.photoURL || undefined,
      phone: fbUser.phoneNumber || '',
      location: 'Nepal (Storefront)',
      isLiveSession: true,
      source: 'Firebase Google Auth & Firestore',
    };

    // Save/merge to Firestore `users` and `customers`
    if (dbInstance) {
      try {
        const userDocRef = doc(dbInstance, 'users', fbUser.uid);
        await setDoc(
          userDocRef,
          {
            uid: fbUser.uid,
            email: profile.email,
            displayName: profile.name,
            photoURL: profile.photoURL || null,
            role: profile.role,
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );

        const customerDocRef = doc(dbInstance, 'customers', fbUser.uid);
        await setDoc(
          customerDocRef,
          {
            uid: fbUser.uid,
            email: profile.email,
            name: profile.name,
            photoURL: profile.photoURL || null,
            status: 'active',
            lastLoginAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (fsErr) {
        console.warn('[firestore] Google sync note:', fsErr);
      }
    }

    return { user: fbUser, profile };
  } catch (error: any) {
    console.error('[firebase-auth] Google sign-in failed:', error);
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error(
        'OAuth domain not authorized in Firebase Console. Please add "localhost" to Authentication > Settings > Authorized Domains in Firebase Console.'
      );
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In was cancelled.');
    } else if (error.code === 'auth/api-key-not-valid') {
      throw new Error(
        'Invalid or missing Firebase API Key. Please update VITE_FIREBASE_API_KEY in your .env file from Firebase Console > Project Settings.'
      );
    }
    throw error;
  }
}

/**
 * Sign out user from Firebase Auth
 */
export async function logoutFirebase(): Promise<void> {
  if (authInstance) {
    await signOut(authInstance);
  }
}

/**
 * Send password reset email
 */
export async function resetFirebasePassword(email: string): Promise<void> {
  if (authInstance) {
    await sendPasswordResetEmail(authInstance, email.trim());
  }
}

/**
 * Realtime listener for Auth State changes
 */
export function onFirebaseAuthState(
  callback: (user: FirebaseUser | null) => void
) {
  if (!authInstance) return () => {};
  return onAuthStateChanged(authInstance, callback);
}

// ============================================================================
// Helper Functions: Firestore Data Access (Store, Products, Customers)
// ============================================================================

/**
 * Syncs any customer object to Firestore customers collection
 */
export async function syncCustomerToFirestore(customer: any): Promise<void> {
  if (!customer?.email || !dbInstance) return;
  try {
    const id = customer.id || customer.uid || customer.email.replace(/[@.]/g, '_');
    const customerRef = doc(dbInstance, 'customers', id);
    await setDoc(
      customerRef,
      {
        uid: customer.id || customer.uid || id,
        email: customer.email,
        name: customer.name || customer.displayName || 'Customer',
        phone: customer.phone || '',
        location: customer.location || 'Nepal',
        status: customer.status || 'active',
        ordersCount: customer.orders || customer.ordersCount || 0,
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[firestore] customer sync skipped:', err);
  }
}

/**
 * Fetch all customers registered in Firestore
 */
export async function getFirestoreCustomers(): Promise<any[]> {
  if (!dbInstance) return [];
  try {
    const snap = await getDocs(collection(dbInstance, 'customers'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[firestore] getFirestoreCustomers note:', err);
    return [];
  }
}
