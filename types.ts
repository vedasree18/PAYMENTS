export enum Screen {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  DASHBOARD = 'DASHBOARD',
  SEND_MONEY = 'SEND_MONEY',
  ENTER_UPI_ID = 'ENTER_UPI_ID',
  SCAN_QR = 'SCAN_QR',
  PAYMENT_AMOUNT = 'PAYMENT_AMOUNT',
  PAYMENT_PIN = 'PAYMENT_PIN',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CHECK_BALANCE = 'CHECK_BALANCE',
  HISTORY = 'HISTORY',
  PROFILE = 'PROFILE',
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export interface Transaction {
  id: string;
  payeeName: string; // The person/entity on the other side
  payeeUpiId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: Date;
  note?: string; // Added optional note field
}

export interface UserPreferences {
  notifications: {
    payment: boolean;
    promotional: boolean;
    failedTxn: boolean;
  };
  security: {
    appLock: boolean;
    biometric: boolean;
  };
  appearance: {
    darkMode: boolean;
  };
  payments: {
    transactionLimit: number;
    confirmPayment: boolean;
  }
}

export interface User {
  name: string;
  email: string;
  password?: string; // Added for security validation
  upiId: string;
  phoneNumber: string; // Registered mobile number for UPI
  balance: number;
  upiPin: string; // Stored securely in real app, plain text here for mock
  preferences: UserPreferences;
}

export interface PaymentContextState {
  recipientUpiId: string;
  recipientName: string;
  amount: number;
  note: string;
}

// Mock Contact Interface
export interface Contact {
  name: string;
  upiId: string;
  avatarColor: string;
  isRecent?: boolean;
}