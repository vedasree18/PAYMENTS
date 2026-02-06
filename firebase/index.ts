/**
 * Firebase Module Exports
 */

export { auth, db } from './config';
export { signUp, signIn, logout, onAuthChange, getCurrentUser } from './auth.service';
export {
  createUserDocument,
  getUserDocument,
  subscribeToUser,
  getUserTransactions,
  subscribeToTransactions,
  updateUserPreferences,
  verifyPin
} from './firestore.service';
export type { FirestoreUser, FirestoreTransaction } from './firestore.service';
