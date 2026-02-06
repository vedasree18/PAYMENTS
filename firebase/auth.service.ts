/**
 * Firebase Authentication Service
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, ADMIN_EMAIL, ADMIN_INITIAL_BALANCE } from './config';
import { createUserDocument, getUserDocument } from './firestore.service';

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string, name: string, upiPin: string) => {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if this is the admin email
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const initialBalance = isAdmin ? ADMIN_INITIAL_BALANCE : 0;
    const role = isAdmin ? 'ADMIN' : 'USER';

    // Create Firestore user document with initial data
    await createUserDocument(user.uid, {
      email,
      name,
      upiPin,
      balance: initialBalance,
      role: role,
      upiId: `${name.toLowerCase().replace(/\s+/g, '')}@novapay`,
      phoneNumber: '+91 98765 43210'
    });

    console.log(`✅ User signed up: ${email} (${role}, Balance: ₹${initialBalance})`);
    return { user, uid: user.uid };
  } catch (error: any) {
    console.error('❌ Sign up error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verify user document exists
    const userDoc = await getUserDocument(user.uid);
    if (!userDoc) {
      throw new Error('User profile not found');
    }

    console.log('✅ User signed in:', email);
    return { user, uid: user.uid };
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    }
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign out
 */
export const logout = async () => {
  try {
    await signOut(auth);
    console.log('✅ User signed out');
  } catch (error: any) {
    console.error('❌ Sign out error:', error);
    throw new Error('Failed to sign out');
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
