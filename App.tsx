import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoadingScreen } from './components/LoadingScreen';
import { Auth } from './screens/Auth';
import { Dashboard } from './screens/Dashboard';
import { ScanQR } from './screens/ScanQR';
import { PaymentFlow } from './screens/PaymentFlow';
import { History } from './screens/History';
import { Profile } from './screens/Profile';
import { SendMoney } from './screens/SendMoney';
import { CheckBalance } from './screens/CheckBalance';
import { EnterUpiId } from './screens/EnterUpiId';
import { LockScreen } from './components/LockScreen';
import { Screen, User, Transaction, PaymentContextState, TransactionStatus, TransactionType } from './types';
import { generateId } from './utils';
import { onAuthChange, getUserDocument, subscribeToUser, logout } from './firebase';

// Initial Mock Data (for display purposes only)
const initialTransactions: Transaction[] = [
  {
    id: 'tx1',
    payeeName: 'Netflix India',
    payeeUpiId: 'netflix@hdfc',
    amount: 649,
    type: TransactionType.DEBIT,
    status: TransactionStatus.SUCCESS,
    timestamp: new Date(Date.now() - 86400000 * 2),
    note: 'Subscription'
  },
  {
    id: 'tx2',
    payeeName: 'Rahul Sharma',
    payeeUpiId: 'rahul@okaxis',
    amount: 2000,
    type: TransactionType.CREDIT,
    status: TransactionStatus.SUCCESS,
    timestamp: new Date(Date.now() - 86400000 * 5),
    note: 'Dinner split'
  }
];

function App() {
  // --- STATE MANAGEMENT ---
  
  // 🔥 CRITICAL: App initialization state (prevents white screen)
  const [isAppReady, setIsAppReady] = useState(false);
  
  // User state (from Firebase)
  const [user, setUser] = useState<User | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Determines current screen
  const [screen, setScreen] = useState<Screen>(Screen.LOGIN);

  // App Lock State
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Payment Context (Transient state for the payment flow)
  const [paymentContext, setPaymentContext] = useState<PaymentContextState>({
    recipientUpiId: '',
    recipientName: '',
    amount: 0,
    note: ''
  });

  // Active Transaction State (for success/fail screens)
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

  // --- 🔥 CRITICAL: FIREBASE AUTH INITIALIZATION (PREVENTS WHITE SCREEN) ---
  useEffect(() => {
    console.log('🚀 Initializing NovaPay with Firebase...');
    
    let userUnsubscribe: (() => void) | null = null;
    
    // Listen to Firebase auth state changes
    const authUnsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('✅ User authenticated:', firebaseUser.email);
          
          // Load user data from Firestore
          const firestoreUser = await getUserDocument(firebaseUser.uid);
          
          if (firestoreUser) {
            const appUser: User = {
              name: firestoreUser.name,
              email: firestoreUser.email,
              password: '',
              phoneNumber: firestoreUser.phoneNumber,
              upiId: firestoreUser.upiId,
              balance: firestoreUser.balance,
              upiPin: firestoreUser.upiPin,
              preferences: firestoreUser.preferences
            };
            
            setUser(appUser);
            setScreen(Screen.DASHBOARD);
            
            // Check app lock
            if (firestoreUser.preferences?.security?.appLock) {
              setIsLocked(true);
            }
            
            // Subscribe to real-time user updates
            userUnsubscribe = subscribeToUser(firebaseUser.uid, (updatedUser) => {
              if (updatedUser) {
                const updatedAppUser: User = {
                  name: updatedUser.name,
                  email: updatedUser.email,
                  password: '',
                  phoneNumber: updatedUser.phoneNumber,
                  upiId: updatedUser.upiId,
                  balance: updatedUser.balance,
                  upiPin: updatedUser.upiPin,
                  preferences: updatedUser.preferences
                };
                setUser(updatedAppUser);
                console.log('🔄 User balance updated:', updatedUser.balance);
              }
            });
          }
        } else {
          console.log('❌ No user authenticated');
          setUser(null);
          setScreen(Screen.LOGIN);
          setTransactions(initialTransactions);
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
        setUser(null);
        setScreen(Screen.LOGIN);
      } finally {
        // ALWAYS mark app as ready (prevents white screen)
        setIsAppReady(true);
      }
    });
    
    // Cleanup auth listener and user subscription on unmount
    return () => {
      authUnsubscribe();
      if (userUnsubscribe) {
        userUnsubscribe();
      }
    };
  }, []);

  // Handle Dark Mode
  useEffect(() => {
    const html = document.documentElement;
    if (user?.preferences.appearance.darkMode) {
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
    }
  }, [user?.preferences.appearance.darkMode]);

  // Recovery from stuck states (e.g. refresh during processing)
  useEffect(() => {
    if (screen === Screen.PAYMENT_PROCESSING) {
       // On refresh, we lose the timeout, so reset to dashboard to avoid infinite loop
       setScreen(Screen.DASHBOARD);
    }
  }, []);


  // --- CORE BANKING LOGIC ---

  const handleLogin = (userData: User) => {
    // Ensure preferences exist
    const userWithPrefs = {
      ...userData,
      preferences: userData.preferences || {
        notifications: { payment: true, promotional: false, failedTxn: true },
        security: { appLock: true, biometric: false },
        appearance: { darkMode: false },
        payments: { transactionLimit: 50000, confirmPayment: true }
      }
    };
    setUser(userWithPrefs);
    setScreen(Screen.DASHBOARD);
    setIsLocked(false);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setScreen(Screen.LOGIN);
      setPaymentContext({ recipientUpiId: '', recipientName: '', amount: 0, note: '' });
      setActiveTransaction(null);
      setIsLocked(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const startPayment = (upiId: string, name: string) => {
    setPaymentContext({
      recipientUpiId: upiId,
      recipientName: name,
      amount: 0,
      note: ''
    });
    setScreen(Screen.PAYMENT_AMOUNT);
  };

  const handleRecipientSelect = (upiId: string, name: string) => {
    setPaymentContext({
      recipientUpiId: upiId,
      recipientName: name,
      amount: 0,
      note: ''
    });
    setScreen(Screen.PAYMENT_AMOUNT);
  };

  // Centralized Payment Processor (Full Flow)
  const processPayment = () => {
    if (!user) return;

    setScreen(Screen.PAYMENT_PROCESSING);

    setTimeout(() => {
      // Mock random success/failure (90% success)
      const isSuccess = Math.random() > 0.1;
      const status = isSuccess ? TransactionStatus.SUCCESS : TransactionStatus.FAILED;
      
      const newTx: Transaction = {
        id: generateId(),
        payeeName: paymentContext.recipientName,
        payeeUpiId: paymentContext.recipientUpiId,
        amount: paymentContext.amount,
        type: TransactionType.DEBIT,
        status: status,
        timestamp: new Date(),
        note: paymentContext.note
      };

      setTransactions(prev => [newTx, ...prev]);
      setActiveTransaction(newTx);

      if (status === TransactionStatus.SUCCESS) {
        setUser(prev => {
           if (!prev) return null;
           return { ...prev, balance: prev.balance - newTx.amount };
        });
      }

      setScreen(status === TransactionStatus.SUCCESS ? Screen.PAYMENT_SUCCESS : Screen.PAYMENT_FAILED);

    }, 3000);
  };

  useEffect(() => {
    if (screen === Screen.PAYMENT_PROCESSING && !activeTransaction) {
      processPayment();
    }
  }, []); 

  // Lightweight Quick Payment Processor (For Dashboard Quick Send)
  const handleQuickPayment = async (recipient: {name: string, upiId: string}, amount: number) => {
    if (!user) return Promise.reject("User not logged in");
    
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // 95% Success rate for quick send
        const isSuccess = Math.random() > 0.05;
        
        if (isSuccess) {
          const newTx: Transaction = {
            id: generateId(),
            payeeName: recipient.name,
            payeeUpiId: recipient.upiId,
            amount: amount,
            type: TransactionType.DEBIT,
            status: TransactionStatus.SUCCESS,
            timestamp: new Date(),
            note: 'Quick Send'
          };
          
          setTransactions(prev => [newTx, ...prev]);
          setUser(prev => {
            if (!prev) return null;
            return { ...prev, balance: prev.balance - amount };
          });
          resolve();
        } else {
          reject("Payment Failed");
        }
      }, 2000);
    });
  };

  // --- RENDER ROUTER ---

  // 🔥 CRITICAL: Show loading screen while app initializes (prevents white screen)
  if (!isAppReady) {
    return <LoadingScreen message="Initializing NovaPay..." />;
  }

  // 🔥 CRITICAL: Always render something (never return null)
  if (user && isLocked) {
    return (
      <LockScreen 
        user={user} 
        onUnlock={() => setIsLocked(false)} 
        onLogout={handleLogout} 
      />
    );
  }

  const renderScreen = () => {
    // 🔥 SAFETY: If no user and not on auth screens, force to login
    if (!user && screen !== Screen.LOGIN && screen !== Screen.SIGNUP) {
      return <Auth onLogin={handleLogin} onNavigate={setScreen} currentScreen={Screen.LOGIN} />;
    }

    // 🔥 SAFETY: If no user, show auth screen
    if (!user) {
       return <Auth onLogin={handleLogin} onNavigate={setScreen} currentScreen={screen} />;
    }

    // User is logged in - render appropriate screen
    try {
      switch (screen) {
      case Screen.DASHBOARD:
        return (
          <Dashboard 
            user={user} 
            transactions={transactions} 
            onNavigate={setScreen} 
            onLogout={handleLogout}
            onQuickPayment={handleQuickPayment}
          />
        );
      case Screen.SEND_MONEY:
        return (
          <SendMoney 
             onBack={() => setScreen(Screen.DASHBOARD)}
             onSelectRecipient={handleRecipientSelect}
             user={user}
             onNavigate={setScreen}
             onLogout={handleLogout}
          />
        );
      case Screen.ENTER_UPI_ID:
        return (
          <EnterUpiId 
             onBack={() => setScreen(Screen.DASHBOARD)}
             onContinue={handleRecipientSelect}
             user={user}
             onNavigate={setScreen}
             onLogout={handleLogout}
          />
        );
      case Screen.SCAN_QR:
        return (
          <ScanQR 
            onBack={() => setScreen(Screen.DASHBOARD)} 
            onScanSuccess={startPayment}
          />
        );
      case Screen.PAYMENT_AMOUNT:
      case Screen.PAYMENT_PIN:
      case Screen.PAYMENT_PROCESSING:
      case Screen.PAYMENT_SUCCESS:
      case Screen.PAYMENT_FAILED:
        return (
          <PaymentFlow 
            user={user}
            paymentContext={paymentContext}
            setPaymentContext={setPaymentContext}
            onNavigate={setScreen}
            onConfirmPayment={processPayment}
            currentScreen={screen}
            activeTransaction={activeTransaction}
          />
        );
      case Screen.CHECK_BALANCE:
        return (
          <CheckBalance 
            user={user} 
            onNavigate={setScreen} 
            onLogout={handleLogout}
          />
        );
      case Screen.HISTORY:
        return (
          <History 
            transactions={transactions} 
            onBack={() => setScreen(Screen.DASHBOARD)}
            onNavigate={setScreen}
            user={user}
            onLogout={handleLogout}
          />
        );
      case Screen.PROFILE:
        return (
          <Profile 
            user={user} 
            onNavigate={setScreen} 
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        // 🔥 SAFETY: Default to dashboard if unknown screen
        console.warn(`Unknown screen: ${screen}, defaulting to dashboard`);
        return <Dashboard user={user} transactions={transactions} onNavigate={setScreen} onLogout={handleLogout} onQuickPayment={handleQuickPayment} />;
    }
    } catch (error) {
      // 🔥 SAFETY: If screen rendering fails, show dashboard
      console.error('Screen rendering error:', error);
      return <Dashboard user={user} transactions={transactions} onNavigate={setScreen} onLogout={handleLogout} onQuickPayment={handleQuickPayment} />;
    }
  };

  // 🔥 CRITICAL: Always return JSX (never null)
  return (
    <Layout>
      {renderScreen()}
    </Layout>
  );
}

export default App;
