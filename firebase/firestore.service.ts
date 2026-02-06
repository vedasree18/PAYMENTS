/**
 * Firestore Database Service
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';

export interface FirestoreUser {
  email: string;
  name: string;
  upiId: string;
  upiPin: string;
  phoneNumber: string;
  balance: number;
  role: string;
  createdAt: any;
  updatedAt: any;
  preferences: {
    notifications: { payment: boolean; promotional: boolean; failedTxn: boolean };
    security: { appLock: boolean; biometric: boolean };
    appearance: { darkMode: boolean };
    payments: { transactionLimit: number; confirmPayment: boolean };
  };
}

export interface FirestoreTransaction {
  id: string;
  senderId: string;
  senderName: string;
  senderUpiId: string;
  receiverId: string;
  receiverName: string;
  receiverUpiId: string;
  amount: number;
  status: string;
  type: string;
  note?: string;
  createdAt: any;
}

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (uid: string, userData: any) => {
  const userRef = doc(db, 'users', uid);
  
  const newUser: FirestoreUser = {
    email: userData.email,
    name: userData.name,
    upiId: userData.upiId,
    upiPin: userData.upiPin,
    phoneNumber: userData.phoneNumber,
    balance: userData.balance || 0, // Use provided balance (0 for USER, 100000 for ADMIN)
    role: userData.role || 'USER',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    preferences: {
      notifications: { payment: true, promotional: false, failedTxn: true },
      security: { appLock: true, biometric: false },
      appearance: { darkMode: false },
      payments: { transactionLimit: 50000, confirmPayment: true }
    }
  };

  await setDoc(userRef, newUser);
  console.log(`✅ User document created: ${uid} (${newUser.role}, Balance: ₹${newUser.balance})`);
};

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (uid: string): Promise<FirestoreUser | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as FirestoreUser;
    } else {
      console.warn('⚠️ User document does not exist:', uid);
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error getting user:', error);
    if (error.code === 'permission-denied') {
      console.error('🔒 Firestore permission denied. Please set up security rules in Firebase Console.');
    }
    return null;
  }
};

/**
 * Subscribe to user data changes (real-time)
 */
export const subscribeToUser = (
  uid: string,
  callback: (user: FirestoreUser | null) => void
): Unsubscribe => {
  const userRef = doc(db, 'users', uid);
  
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const userData = snapshot.data() as FirestoreUser;
      console.log('🔄 User data updated:', userData.balance);
      callback(userData);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('❌ User subscription error:', error);
    callback(null);
  });
};

/**
 * Get user transactions
 */
export const getUserTransactions = async (uid: string): Promise<FirestoreTransaction[]> => {
  try {
    const txRef = collection(db, 'transactions');
    const q = query(
      txRef,
      where('senderId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: FirestoreTransaction[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreTransaction);
    });
    
    return transactions;
  } catch (error) {
    console.error('❌ Error getting transactions:', error);
    return [];
  }
};

/**
 * Subscribe to user transactions (real-time)
 */
export const subscribeToTransactions = (
  uid: string,
  callback: (transactions: FirestoreTransaction[]) => void
): Unsubscribe => {
  const txRef = collection(db, 'transactions');
  const q = query(
    txRef,
    where('senderId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const transactions: FirestoreTransaction[] = [];
    snapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      } as FirestoreTransaction);
    });
    console.log('🔄 Transactions updated:', transactions.length);
    callback(transactions);
  }, (error) => {
    console.error('❌ Transactions subscription error:', error);
    callback([]);
  });
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (uid: string, preferences: any) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    preferences,
    updatedAt: serverTimestamp()
  });
};

/**
 * Verify UPI PIN
 */
export const verifyPin = async (uid: string, pin: string): Promise<boolean> => {
  const user = await getUserDocument(uid);
  return user?.upiPin === pin;
};
