/**
 * App.tsx - Firebase Integrated Version
 * COMPLETE MIGRATION from LocalStorage to Firebase
 * All data stored in Firestore with real-time sync
 */

import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
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

// 🔥 FIREBASE IMPORTS - Replace LocalStorage
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import {
  getUserDocument,
  getUserTransactions,
  transferMoney,
  verifyAndUpdatePinTimestamp,
  getUserBalance,
  signOutUser,
  updateUserPreferences,
  subscribeToUserBalance,
  subscribeToUserTransactions,
  FirestoreUser
} from './firebase';
import { UserRole } from './firebase/config';

function App() {
  // 🔥 FIREBASE AUTH HOOK - Replaces LocalStorage auth
  const { uid, loading: authLoading, isAuthenticated } = useFirebaseAuth();

  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [screen, setScreen] = useState<Screen>(Screen.LOGIN);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [paymentContext, setPaymentContext] = useState<PaymentContextState>({
    recipientUpiId: '',
    recipientName: '',
    amount: 0,
    note: ''
  });
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);

  // 🔥 BALANCE SECURITY STATE
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // 🔥 LOAD USER DATA FROM FIREBASE
  useEffect(() => {
    if (uid && isAuthenticated) {
      loadUserData(uid);
    } else {
      // Not authenticated - clear state
      setUser(null);
      setTransactions([]);
      setBalanceVisible(false);
      if (screen !== Screen.LOGIN && screen !== Screen.SIGNUP) {
        setScreen(Screen.LOGIN);
      }
    }
  }, [uid, isAuthenticated]);

  // 🔥 LOAD USER DATA FROM FIRESTORE
  const loadUserData = async (userId: string) => {
    try {
      const firestoreUser = await getUserDocument(userId);
      
      if (!firestoreUser) {
        console.error('User document not found');
        await signOutUser();
        return;
      }

      // Convert Firestore user to App user
      const appUser: User = convertFirestoreToAppUser(firestoreUser);
      setUser(appUser);
      setScreen(Screen.DASHBOARD);

      // 🔥 REAL-TIME BALANCE SYNC
      subscribeToUserBalance(userId, (balance, role) => {
        setUser(prev => prev ? { ...prev, balance } : null);
      });

      // 🔥 REAL-TIME TRANSACTIONS SYNC
      subscribeToUserTransactions(userId, (txs) => {
        setTransactions(txs);
      });

      // Check if app lock is enabled
      if (firestoreUser.security.appLock) {
        setIsLocked(true);
      }

    } catch (error: any) {
      console.error('Failed to load user data:', error);
      await signOutUser();
      setScreen(Screen.LOGIN);
    }
  };

  // Convert Firestore user to App user format
  const convertFirestoreToAppUser = (firestoreUser: FirestoreUser): User => {
    return {
      name: firestoreUser.name,
      email: firestoreUser.email,
      password: '', // Don't expose password
      phoneNumber: firestoreUser.phoneNumber || '+91 98765 43210',
      upiId: firestoreUser.upiId,
      balance: balanceVisible ? firestoreUser.balance : 0, // Hide by default
      upiPin: firestoreUser.upiPin,
      preferences: firestoreUser.preferences
    };
  };

  // 🔥 HANDLE LOGIN
  const handleLogin = async (userData: User) => {
    // User data is loaded by Firebase auth
    setUser(userData);
    setScreen(Screen.DASHBOARD);
    setIsLocked(false);
  };

  // 🔥 HANDLE LOGOUT
  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setTransactions([]);
      setBalanceVisible(false);
      setScreen(Screen.LOGIN);
      setPaymentContext({ recipientUpiId: '', recipientName: '', amount: 0, note: '' });
      setActiveTransaction(null);
      setIsLocked(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 🔥 REVEAL BALANCE (requires PIN verification)
  const handleRevealBalance = async (pin: string): Promise<boolean> => {
    if (!uid) return false;

    try {
      setBalanceLoading(true);
      
      // Verify PIN and update timestamp
      const verified = await verifyAndUpdatePinTimestamp(uid, pin);
      
      if (verified) {
        // Fetch actual balance
        const balance = await getUserBalance(uid);
        
        // Update user state with real balance
        setUser(prev => prev ? { ...prev, balance } : null);
        setBalanceVisible(true);

        // Auto-hide after 60 seconds
        setTimeout(() => {
          setBalanceVisible(false);
          setUser(prev => prev ? { ...prev, balance: 0 } : null);
        }, 60000);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Balance reveal error:', error);
      return false;
    } finally {
      setBalanceLoading(false);
    }
  };

  // 🔥 PROCESS PAYMENT WITH FIREBASE
  const processPayment = async () => {
    if (!uid || !user) return;

    setScreen(Screen.PAYMENT_PROCESSING);

    try {
      // 🔥 ATOMIC FIREBASE TRANSACTION
      const result = await transferMoney(
        uid,
        paymentContext.recipientUpiId,
        paymentContext.amount,
        paymentContext.note
      );

      if (result.success) {
        // Reload user data and transactions (real-time listeners will update)
        await loadUserData(uid);

        // Create transaction object for display
        const newTx: Transaction = {
          id: result.transactionId || generateId(),
          payeeName: paymentContext.recipientName,
          payeeUpiId: paymentContext.recipientUpiId,
          amount: paymentContext.amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.SUCCESS,
          timestamp: new Date(),
          note: paymentContext.note
        };

        setActiveTransaction(newTx);
        setScreen(Screen.PAYMENT_SUCCESS);
      } else {
        // Payment failed
        const failedTx: Transaction = {
          id: generateId(),
          payeeName: paymentContext.recipientName,
          payeeUpiId: paymentContext.recipientUpiId,
          amount: paymentContext.amount,
          type: TransactionType.DEBIT,
          status: TransactionStatus.FAILED,
          timestamp: new Date(),
          note: paymentContext.note
        };

        setActiveTransaction(failedTx);
        setScreen(Screen.PAYMENT_FAILED);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      
      const failedTx: Transaction = {
        id: generateId(),
        payeeName: paymentContext.recipientName,
        payeeUpiId: paymentContext.recipientUpiId,
        amount: paymentContext.amount,
        type: TransactionType.DEBIT,
        status: TransactionStatus.FAILED,
        timestamp: new Date(),
        note: paymentContext.note
      };

      setActiveTransaction(failedTx);
      setScreen(Screen.PAYMENT_FAILED);
    }
  };

  // 🔥 QUICK PAYMENT WITH FIREBASE
  const handleQuickPayment = async (
    recipient: { name: string; upiId: string },
    amount: number
  ): Promise<void> => {
    if (!uid || !user) throw new Error('User not logged in');

    return new Promise(async (resolve, reject) => {
      try {
        const result = await transferMoney(
          uid,
          recipient.upiId,
          amount,
          'Quick Send'
        );

        if (result.success) {
          // Real-time listeners will update balance and transactions
          resolve();
        } else {
          reject(new Error(result.error || 'Payment failed'));
        }
      } catch (error: any) {
        reject(error);
      }
    });
  };

  // 🔥 UPDATE USER PREFERENCES IN FIREBASE
  const handleUpdateUser = async (updatedUser: User) => {
    if (!uid) return;

    try {
      // Update in Firestore
      await updateUserPreferences(uid, updapp;
t default Aor

exp
}out>
  );    </Layeen()}
  {renderScrt>
    ou  <Lay
  eturn (
  };

  r   }nt} />;
 ckPaymeQui{handleuickPayment=} onQoutleLogout={handen} onLoge={setScreonNavigatctions} {transansactions=ser} trard user={ushboarn <Da    retuault:
        def  );
  />
               
 User}dleUpdateeUser={han    onUpdat      Logout}
  dlehan onLogout={      
     } Screenset={te   onNaviga      {user} 
        user=
       e   <Profil
           return (ILE:
     creen.PROF     case S   );
 >
           /gout}
    t={handleLo     onLogou
       user}ser={       un}
     te={setScreeaviga        onN  )}
  ASHBOARDreen.Dreen(ScetSc() => snBack={  o          
 sactions}ions={tran    transact        History 
        <
     return (RY:
     Screen.HISTO
      case  );            />

     gout}leLondha={onLogout        
     en}etScrevigate={snNa        o    r} 
useser={         uance 
     <CheckBal
        return (    :
    NCE.CHECK_BALAse Screenca;
            )    />
  ion}
      Transacttion={activeTransac    active  
      screen}Screen={urrent       cent}
     essPaymyment={procrmPa     onConfi
       }Screente={setnNaviga   o         ontext}
tC{setPaymentext=tConmenetPay          sntext}
  ymentCoxt={pantConte payme           er}
 user={us           Flow 
yment  <Pa     rn (
   retu        :
ILED_FANTMEreen.PAY   case Sc
   T_SUCCESS:MENe Screen.PAY      casING:
ESSAYMENT_PROCScreen.P      case _PIN:
YMENTScreen.PA   case   T_AMOUNT:
 PAYMENn. case Scree   
         );
         />
  ment}tartPayss={snSucceca      onS
      SHBOARD)} en(Screen.DA setScreack={() =>onB       R 
     anQ         <Sc(
 turn      reQR:
   creen.SCAN_    case S);
  >
              /
    dleLogout}gout={han      onLo   
    n}ee{setScrgate=nNavi       o   er}
   user={us       ct}
      pientSele={handleReciinueonCont            }
 OARD)een.DASHBScrreen( => setScack={()      onB      d 
 erUpiI   <Ent
        return (:
       R_UPI_IDeen.ENTE   case Scr     );
        />
      ogout}
  andleL{honLogout=         
    een}te={setScrNaviga        onser}
     {ur=se     u      elect}
  ipientShandleRecent={piectReciel  onS         ARD)}
  ASHBOn.Dcreeeen(SetScrk={() => sBac   on   
       dMoney en <S   
        return (  :
    D_MONEYeen.SEN case Scr  );
     
              />
  kPayment}andleQuicment={hPayuick onQ          
 gout}dleLoLogout={han      on} 
      tScreenavigate={se     onN    tions} 
   s={transaction     transacr} 
         user={use       rd 
   ashboa     <D (
     urnet     r
   HBOARD:DASreen.case Scn) {
      eeh (scrtc

    swi   }een} />;
 {scrScreen=entreen} currate={setSconNavigdleLogin} nLogin={hanturn <Auth o  re {
     r) if (!use   

>;
    }LOGIN} /en.creen={ScrerrentSn} curee{setScavigate=onNeLogin} n={handlonLogi<Auth urn 
      reten.SIGNUP) {Scren !== screen.LOGIN &&  !== Scree screencated &&sAuthenti
    if (!iICATEDHENT NOT AUT LOGIN IF FORCE // 🔥 => {
   creen = () renderSonst
  c-ER ROUTER --END
  // --- R
  }
    );>

      / ogout}out={handleLnLog 
        ocked(false)}) => setIsLonlock={( onU     
  user}   user={
      ckScreen 
      <Lon ({
    returked) er && isLocEN
  if (usCK SCRE 🔥 LO
  }

  //ut>
    );     </Layodiv>
       </</div>
     
       p>..</ding.600">Loa"text-gray-sName=as  <p cl         "></div>
 auto mb-4mx-te-spin d-full animandesparent rouorder-t-tran00 bgo-6ndier-iordborder-4 b h-16 sName="w-16   <div clas     iv>
       <d  
     t-center">en texscreh-r min-ify-centecenter justex items-e="fliv classNam  <d   ayout>
         <L return (
ding) {
   hLoa  if (autG AUTH
CHECKINHILE OADING WHOW L 🔥 S
  //kMode]);
arance.darpences.apprefere, [user?. }
  }   mode');
dark-.remove('ml.classList      ht{
    } else mode');
ark-d('dassList.ad  html.cl{
    e.darkMode) arancerences.appeuser?.pref;
    if (ementcumentElocument.do html = donst
    c{) =>  useEffect((
 tode effecDark m
  // 
;
  };_AMOUNT)ENTen.PAYMScreen(Scre
    set'
    });    note: ': 0,
    amountame,
    me: nentNa     recipiId,
 : upipiIdcipientU   re({
   xtaymentConte {
    setPstring) =>g, name: iId: strin (upect =tSeleRecipient handl  cons;

NT);
  }MOUT_Areen.PAYMENeen(Sccr);
    setS
    }note: '': 0,
      mounte,
      aentName: nam recipiId,
     : upipiIdtUipien rec    
 ontext({entC  setPaym  ring) => {
name: stg, iniId: strupent = (startPaymonst ers
  cflow help/ Payment 

  / }
  };ror);
    user:', erdateled to upaierror('F  console.{
    rror) } catch (e  ;
  edUser)updatetUser(e
      sstatocal date l   // Up      
   s);
ferencetedUser.pre