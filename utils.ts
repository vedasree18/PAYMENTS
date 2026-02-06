export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getCurrentTimestamp = (): string => {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

// Storage Key Constants
const STORAGE_KEYS = {
  USER: 'novapay_user',
  TRANSACTIONS: 'novapay_transactions',
  SESSION: 'novapay_session',
};

// Safe LocalStorage Wrapper
export const storage = {
  getUser: () => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.USER);
      if (!item) return null;
      return JSON.parse(item);
    } catch (e) {
      console.error('Error reading user from storage:', e);
      return null;
    }
  },
  setUser: (user: any) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user to storage:', e);
    }
  },
  getTransactions: () => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!item) return null;
      const txs = JSON.parse(item);
      // Rehydrate Date objects from strings
      return txs.map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp)
      }));
    } catch (e) {
      console.error('Error reading transactions from storage:', e);
      return null;
    }
  },
  setTransactions: (txs: any[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    } catch (e) {
      console.error('Error saving transactions to storage:', e);
    }
  },
  // Session Persistence for page refreshes
  getSession: () => {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!item) return null;
      const session = JSON.parse(item);
      // Rehydrate transaction date if exists
      if (session.activeTransaction) {
        session.activeTransaction.timestamp = new Date(session.activeTransaction.timestamp);
      }
      return session;
    } catch (e) {
      console.error('Error reading session from storage:', e);
      return null;
    }
  },
  setSession: (session: any) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.error('Error saving session to storage:', e);
    }
  },
  clearSession: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      // We intentionally keep transactions in local storage for this demo
    } catch (e) {
      console.error('Error clearing session:', e);
    }
  }
};