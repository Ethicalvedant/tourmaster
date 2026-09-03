import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { UserAuth } from './types';

// Your web app's Firebase configuration provided for TourMaster
export const firebaseConfig = {
  apiKey: "AIzaSyB4yzxDrtMBkzF4OEo8CJwv8fU8OA1jhXI",
  authDomain: "tourmaster-4aa35.firebaseapp.com",
  projectId: "tourmaster-4aa35",
  storageBucket: "tourmaster-4aa35.firebasestorage.app",
  messagingSenderId: "487337114861",
  appId: "1:487337114861:web:e5b8d23f59a2dc130e60e4"
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

/**
 * Maps Firebase Auth error codes to user-friendly messages
 */
export function formatFirebaseAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to many failed attempts. Try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in the Firebase console. Please enable it in Firebase Authentication settings.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Helper to save or update user metadata in Firestore
 */
export async function saveUserProfile(uid: string, profile: Partial<UserAuth> & { lastLoginAt?: string }): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const dataToSave = {
      uid: uid,
      id: uid,
      fullName: profile.name || '',
      name: profile.name || '',
      email: profile.email || '',
      phoneNumber: profile.phone || '',
      phone: profile.phone || '',
      role: profile.role || 'tourist',
      updatedAt: new Date().toISOString(),
      ...(profile.lastLoginAt ? { lastLoginAt: profile.lastLoginAt } : { createdAt: new Date().toISOString() })
    };
    
    await setDoc(userRef, dataToSave, { merge: true });
    console.log('✅ User document synced to Firestore collection "users":', uid, dataToSave);
  } catch (err: any) {
    console.error('⚠️ Firestore sync notice:', err);
    if (err?.code === 'permission-denied') {
      console.warn('👉 Firestore security rules require write permissions. Set rules to allow authenticated users in Firebase Console.');
    }
  }
}

/**
 * Helper to get user metadata from Firestore
 */
export async function fetchUserProfile(uid: string): Promise<Partial<UserAuth> | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: uid,
        name: data.fullName || data.name || '',
        email: data.email || '',
        role: data.role || 'tourist',
        phone: data.phoneNumber || data.phone || '',
        isAuthenticated: true
      };
    }
  } catch (err) {
    console.warn('Could not read user profile from Firestore:', err);
  }
  return null;
}

/**
 * Register a new user with Firebase Authentication and create document in Firestore
 */
export async function signUpWithFirebase(
  name: string,
  email: string,
  pass: string,
  role: 'tourist' | 'provider' | 'admin' = 'tourist',
  phone: string = ''
): Promise<UserAuth> {
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = credential.user;

  if (name) {
    await updateProfile(fbUser, { displayName: name });
  }

  const userAuthData: UserAuth = {
    id: fbUser.uid,
    name: name || fbUser.email?.split('@')[0] || 'TourMaster User',
    email: fbUser.email || email,
    role: role,
    phone: phone || '',
    isAuthenticated: true
  };

  // Cache in local storage for instant offline availability
  localStorage.setItem(`tourmaster_user_${fbUser.uid}`, JSON.stringify(userAuthData));
  
  // Write full user document to Firestore "users" collection
  await saveUserProfile(fbUser.uid, userAuthData);

  return userAuthData;
}

/**
 * Sign in existing user with Firebase Authentication and sync metadata
 */
export async function signInWithFirebase(email: string, pass: string): Promise<UserAuth> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = credential.user;

  // Attempt to load profile from Firestore or local cache
  let profile = await fetchUserProfile(fbUser.uid);
  if (!profile) {
    const cached = localStorage.getItem(`tourmaster_user_${fbUser.uid}`);
    if (cached) {
      try { profile = JSON.parse(cached); } catch (e) { }
    }
  }

  const userAuthData: UserAuth = {
    id: fbUser.uid,
    name: profile?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'TourMaster User',
    email: fbUser.email || email,
    role: (profile?.role as any) || 'tourist',
    phone: profile?.phone || '',
    isAuthenticated: true
  };

  localStorage.setItem(`tourmaster_user_${fbUser.uid}`, JSON.stringify(userAuthData));
  
  // Sync to Firestore with lastLoginAt timestamp
  await saveUserProfile(fbUser.uid, {
    ...userAuthData,
    lastLoginAt: new Date().toISOString()
  });

  return userAuthData;
}

/**
 * Sign out current Firebase user
 */
export async function signOutWithFirebase(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(role: 'tourist' | 'provider' | 'admin' = 'tourist'): Promise<UserAuth> {
  const credential = await signInWithPopup(auth, googleProvider);
  const fbUser = credential.user;

  let profile = await fetchUserProfile(fbUser.uid);
  if (!profile) {
    profile = {
      name: fbUser.displayName || 'Google User',
      email: fbUser.email || '',
      role: role,
      phone: fbUser.phoneNumber || ''
    };
    await saveUserProfile(fbUser.uid, profile);
  }

  const userAuthData: UserAuth = {
    id: fbUser.uid,
    name: fbUser.displayName || profile.name || 'Google User',
    email: fbUser.email || '',
    role: (profile.role as any) || role,
    phone: profile.phone || '',
    isAuthenticated: true
  };

  localStorage.setItem(`tourmaster_user_${fbUser.uid}`, JSON.stringify(userAuthData));
  return userAuthData;
}

/**
 * Real-time Firebase Auth listener (optimized for fast loading)
 */
export function subscribeToAuth(callback: (user: UserAuth | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }

    // Try cache first for instant response (non-blocking)
    let profile = null;
    const cached = localStorage.getItem(`tourmaster_user_${fbUser.uid}`);
    if (cached) {
      try {
        profile = JSON.parse(cached);
        const userAuthData: UserAuth = {
          id: fbUser.uid,
          name: profile?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'TourMaster User',
          email: fbUser.email || '',
          role: (profile?.role as any) || 'tourist',
          phone: profile?.phone || '',
          isAuthenticated: true
        };
        callback(userAuthData);
        // Fetch fresh profile in background without blocking
        fetchUserProfile(fbUser.uid).then(freshProfile => {
          if (freshProfile && JSON.stringify(freshProfile) !== JSON.stringify(profile)) {
            const updatedData: UserAuth = {
              id: fbUser.uid,
              name: freshProfile?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'TourMaster User',
              email: fbUser.email || '',
              role: (freshProfile?.role as any) || 'tourist',
              phone: freshProfile?.phone || '',
              isAuthenticated: true
            };
            callback(updatedData);
          }
        }).catch(() => { });
        return;
      } catch (e) { }
    }

    // Fallback: fetch from Firestore with timeout
    const fetchWithTimeout = new Promise<Partial<UserAuth> | null>((resolve) => {
      const timeoutId = setTimeout(() => resolve(null), 3000); // 3s timeout
      fetchUserProfile(fbUser.uid)
        .then(result => { clearTimeout(timeoutId); resolve(result); })
        .catch(() => { clearTimeout(timeoutId); resolve(null); });
    });

    profile = await fetchWithTimeout;

    const userAuthData: UserAuth = {
      id: fbUser.uid,
      name: profile?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'TourMaster User',
      email: fbUser.email || '',
      role: (profile?.role as any) || 'tourist',
      phone: profile?.phone || '',
      isAuthenticated: true
    };

    callback(userAuthData);
  });
}
