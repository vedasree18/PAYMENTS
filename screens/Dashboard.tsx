import React, { useState, useEffect, useRef } from 'react';
import { User, Transaction, Screen, TransactionType, TransactionStatus, Contact } from '../types';
import { formatCurrency } from '../utils';
import { 
  QrCode, Send, History, LogOut, ArrowUpRight, ArrowDownLeft, 
  Shield, Wallet, CreditCard, RefreshCw, Eye, EyeOff, 
  ChevronRight, Bell, Zap, Banknote, AtSign, Plus, X, Loader2, CheckCircle2, ChevronLeft, Lock, ArrowRight, ShieldCheck
} from 'lucide-react';
import { Button } from '../components/Button';
import { DesktopHeader, MobileBottomNav } from '../components/Navigation';
import { Numpad } from '../components/Numpad';

interface DashboardProps {
  user: User;
  transactions: Transaction[];
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  onQuickPayment: (contact: { name: string; upiId: string }, amount: number) => Promise<void>;
}

// Mock Frequent Contacts for Quick Send
const QUICK_CONTACTS: Contact[] = [
  { name: 'Mom', upiId: 'mom@upi', avatarColor: 'bg-pink-100 text-pink-600' },
  { name: 'Dad', upiId: 'dad@upi', avatarColor: 'bg-blue-100 text-blue-600' },
  { name: 'Rahul', upiId: 'rahul@upi', avatarColor: 'bg-green-100 text-green-600' },
  { name: 'Wifi', upiId: 'wifi@act', avatarColor: 'bg-purple-100 text-purple-600' },
  { name: 'Shop', upiId: 'shop@merch', avatarColor: 'bg-yellow-100 text-yellow-600' },
  { name: 'Priya', upiId: 'priya@axis', avatarColor: 'bg-teal-100 text-teal-600' },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, transactions, onNavigate, onLogout, onQuickPayment }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(false); // Secure default: Hidden
  const [isVerifyingBalance, setIsVerifyingBalance] = useState(false);
  const [quickSendContact, setQuickSendContact] = useState<Contact | null>(null);

  // Auto-hide balance after 60 seconds for security
  useEffect(() => {
    if (showBalance) {
      const timer = setTimeout(() => setShowBalance(false), 60000);
      return () => clearTimeout(timer);
    }
  }, [showBalance]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate network delay
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const toggleBalance = () => {
    if (showBalance) {
      setShowBalance(false);
    } else {
      setIsVerifyingBalance(true);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // --- Components ---

  const BalanceCard = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`relative overflow-hidden ${mobile ? 'rounded-3xl p-6' : 'rounded-[2rem] p-8'} bg-gradient-to-br from-[#1e1e2f] to-[#2d2d44] text-white shadow-xl shadow-indigo-900/20`}>
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -ml-10 -mb-10 pointer-events-none"></div>

       <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 w-fit">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-medium tracking-wide text-indigo-100">UPI SECURE</span>
             </div>
             <button 
               onClick={handleRefresh} 
               className={`p-2 hover:bg-white/10 rounded-full transition-all ${isRefreshing ? 'animate-spin' : ''}`}
               disabled={isRefreshing}
             >
                <RefreshCw className="w-4 h-4 text-indigo-200" />
             </button>
          </div>

          <div className="mt-4">
             <div className="flex items-center gap-2 mb-1">
                <p className="text-indigo-200 text-sm font-medium">Total Balance</p>
                <button 
                  onClick={toggleBalance} 
                  className="text-indigo-300 hover:text-white transition-colors p-1 -ml-1 rounded-md hover:bg-white/5"
                  title={showBalance ? "Hide Balance" : "View Balance"}
                >
                   {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
             </div>
             
             <div className="flex items-baseline gap-1 h-12 md:h-14">
                {showBalance ? (
                   <h1 className={`${mobile ? 'text-4xl' : 'text-5xl'} font-bold tracking-tight animate-fade-in`}>
                     {formatCurrency(user.balance)}
                   </h1>
                ) : (
                   <div className="flex items-center gap-1.5 h-full pt-2">
                      <span className="text-2xl md:text-3xl text-indigo-300 font-bold mr-1">₹</span>
                      <div className="flex gap-1.5">
                         {[0,1,2,3,4].map(i => (
                            <div key={i} className="w-3 h-3 md:w-4 md:h-4 bg-indigo-400/50 rounded-full"></div>
                         ))}
                      </div>
                   </div>
                )}
             </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-bold">UPI ID</span>
                <span className="text-sm font-mono text-white/90">{user.upiId}</span>
             </div>
             {/* Decorative Chip */}
             <div className="hidden md:block">
                <div className="h-8 w-12 rounded bg-white/10 flex items-center justify-center border border-white/5">
                   <div className="w-6 h-4 bg-yellow-500/80 rounded-sm"></div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const ActionGrid = () => (
    <div className="grid grid-cols-4 gap-4 md:gap-6">
       <QuickAction 
         icon={<QrCode className="w-6 h-6 md:w-7 md:h-7" />} 
         label="Scan QR" 
         onClick={() => onNavigate(Screen.SCAN_QR)} 
         color="bg-blue-50 text-blue-600"
       />
       <QuickAction 
         icon={<Send className="w-6 h-6 md:w-7 md:h-7" />} 
         label="Contacts" 
         onClick={() => onNavigate(Screen.SEND_MONEY)} 
         color="bg-indigo-50 text-indigo-600"
       />
       <QuickAction 
         icon={<AtSign className="w-6 h-6 md:w-7 md:h-7" />} 
         label="Pay UPI" 
         onClick={() => onNavigate(Screen.ENTER_UPI_ID)} 
         color="bg-purple-50 text-purple-600"
       />
       <QuickAction 
         icon={<CreditCard className="w-6 h-6 md:w-7 md:h-7" />} 
         label="Balance" 
         onClick={() => onNavigate(Screen.CHECK_BALANCE)} 
         color="bg-orange-50 text-orange-600"
       />
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50 md:bg-gray-100 min-h-screen pb-20 md:pb-0">
      <DesktopHeader currentScreen={Screen.DASHBOARD} onNavigate={onNavigate} user={user} onLogout={onLogout} />

      <div className="flex-1 max-w-6xl mx-auto w-full md:p-8 flex flex-col">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white p-6 pb-2 rounded-b-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => onNavigate(Screen.PROFILE)}
                className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md cursor-pointer"
              >
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium">{getGreeting()},</span>
                <span className="text-lg font-bold text-gray-900 leading-none">{user.name.split(' ')[0]}</span>
              </div>
            </div>
            <div className="flex gap-2">
               <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative">
                 <Bell className="w-6 h-6" />
                 <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               </button>
            </div>
          </div>
          
          <div className="mb-6">
             <BalanceCard mobile />
          </div>

          {/* Quick Send Row (Mobile) */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Quick Send
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              <button 
                 onClick={() => onNavigate(Screen.SEND_MONEY)}
                 className="flex flex-col items-center gap-2 min-w-[60px]"
              >
                 <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Plus className="w-6 h-6" />
                 </div>
                 <span className="text-xs font-medium text-gray-500">New</span>
              </button>
              {QUICK_CONTACTS.map((contact, i) => (
                 <button
                   key={i}
                   onClick={() => setQuickSendContact(contact)}
                   className="flex flex-col items-center gap-2 min-w-[60px] group"
                 >
                    <div className={`w-14 h-14 rounded-full ${contact.avatarColor} flex items-center justify-center text-lg font-bold shadow-sm relative overflow-hidden group-active:scale-95 transition-transform`}>
                       {contact.name.charAt(0)}
                       <div className="absolute inset-0 bg-black opacity-0 group-active:opacity-10 transition-opacity"></div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate w-full text-center">{contact.name}</span>
                 </button>
              ))}
            </div>
          </div>

          <div className="pb-6">
             <ActionGrid />
          </div>
        </header>

        {/* DESKTOP CONTENT */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-8 px-4 md:px-0">
           
           {/* Left/Main Column */}
           <div className="md:col-span-8 flex flex-col gap-8">
              {/* Desktop Balance + Actions */}
              <div className="hidden md:block space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                       <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}, {user.name}</h1>
                       <p className="text-gray-500 mt-1">Here is your financial overview.</p>
                    </div>
                    <div className="flex gap-3">
                       <Button variant="secondary" className="!py-2 !px-4 text-sm" onClick={() => onNavigate(Screen.SEND_MONEY)}>
                          <Zap className="w-4 h-4 mr-2" /> Quick Transfer
                       </Button>
                    </div>
                 </div>

                 <BalanceCard />

                 <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                    <ActionGrid />
                 </div>
              </div>

              {/* Transactions Section */}
              <div className="bg-white md:bg-white/50 rounded-[2rem] p-6 md:p-0 md:bg-transparent shadow-sm md:shadow-none border border-gray-100 md:border-none">
                 <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                    <button 
                      onClick={() => onNavigate(Screen.HISTORY)}
                      className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="flex flex-col gap-3">
                   {transactions.length === 0 ? (
                      <EmptyState onAction={() => onNavigate(Screen.SEND_MONEY)} />
                   ) : (
                      transactions.slice(0, 5).map((tx) => (
                        <TransactionItem key={tx.id} tx={tx} />
                      ))
                   )}
                 </div>
              </div>
           </div>

           {/* Right Sidebar (Desktop) / Offers (Mobile) */}
           <div className="md:col-span-4 space-y-6">
              
              {/* Promo Card */}
              <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden group cursor-pointer">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
                 <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                       <Zap className="w-6 h-6 text-yellow-300 fill-current" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Refer & Earn</h3>
                    <p className="text-indigo-100 text-sm mb-4">Invite friends to NovaPay and earn ₹100 cashback instantly.</p>
                    <button className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-colors">
                       Invite Now
                    </button>
                 </div>
              </div>

              {/* Quick Contacts (Desktop) */}
              <div className="hidden md:block bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Quick Send
                 </h3>
                 <div className="grid grid-cols-4 gap-4">
                    {QUICK_CONTACTS.slice(0, 4).map((contact, i) => (
                       <button 
                         key={i} 
                         onClick={() => setQuickSendContact(contact)}
                         className="flex flex-col items-center gap-2 group cursor-pointer" 
                       >
                          <div className={`w-14 h-14 rounded-full ${contact.avatarColor} flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform shadow-sm`}>
                             {contact.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-600 group-hover:text-indigo-600">{contact.name}</span>
                       </button>
                    ))}
                    <button onClick={() => onNavigate(Screen.SEND_MONEY)} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-indigo-300 group-hover:text-indigo-500 transition-all">
                           <ChevronRight className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-gray-400">More</span>
                    </button>
                 </div>
              </div>

           </div>
        </div>

        {/* Quick Send Overlay */}
        {quickSendContact && (
          <QuickSendOverlay 
            contact={quickSendContact} 
            user={user}
            onClose={() => setQuickSendContact(null)} 
            onSuccess={async (amount) => {
               await onQuickPayment(quickSendContact, amount);
               // Add a tiny delay before closing to show success state
               return new Promise(resolve => setTimeout(resolve, 1500));
            }}
          />
        )}

        {/* Balance Verification Overlay */}
        {isVerifyingBalance && (
          <BalanceVerificationOverlay 
            user={user}
            onClose={() => setIsVerifyingBalance(false)}
            onSuccess={() => {
              setShowBalance(true);
              setIsVerifyingBalance(false);
            }}
          />
        )}

      </div>
      <MobileBottomNav currentScreen={Screen.DASHBOARD} onNavigate={onNavigate} />
    </div>
  );
};

// --- Helper Components ---

// Balance Verification Overlay
interface BalanceVerificationOverlayProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const BalanceVerificationOverlay: React.FC<BalanceVerificationOverlayProps> = ({ user, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShake, setIsShake] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus for desktop
    if (window.innerWidth >= 768) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, []);

  const handlePinSubmit = () => {
    if (pin.length !== 4) return;
    
    if (pin !== user.upiPin) {
      setError('Incorrect PIN');
      setIsShake(true);
      setPin('');
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    setIsProcessing(true);
    // Slight delay to simulate verification
    setTimeout(() => {
      onSuccess();
    }, 500);
  };

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') handlePinSubmit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pin]);

  // Desktop Render
  const renderDesktop = () => (
    <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-scale-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">View Balance</h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
        </div>

        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
             <Lock className="w-8 h-8" />
           </div>
           <p className="text-gray-500 text-sm">Enter UPI PIN to reveal balance securely</p>
        </div>

        <div className="mb-8">
           <div className={`flex justify-center gap-4 mb-4 ${isShake ? 'animate-shake' : ''}`}>
              {[0,1,2,3].map(i => (
                 <div key={i} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                    pin.length === i ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' :
                    pin.length > i ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200'
                 }`}>
                    {pin.length > i ? '•' : ''}
                 </div>
              ))}
           </div>
           {error && <p className="text-red-500 text-xs font-bold text-center animate-fade-in">{error}</p>}
           
           <input 
              ref={inputRef}
              type="password"
              maxLength={4}
              className="opacity-0 absolute w-0 h-0"
              value={pin}
              onChange={(e) => {
                 setPin(e.target.value.replace(/\D/g, ''));
                 setError('');
              }}
           />
        </div>

        <Button fullWidth onClick={handlePinSubmit} disabled={pin.length !== 4 || isProcessing}>
           {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify PIN'}
        </Button>
      </div>
    </div>
  );

  // Mobile Render
  const renderMobile = () => (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
       <div className="relative bg-white w-full rounded-t-[2rem] p-6 pb-0 shadow-2xl animate-slide-up overflow-hidden">
          <div className="text-center mb-6">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1 mb-2">
                <ShieldCheck className="w-3 h-3 text-indigo-500" /> Security Check
             </p>
             <h3 className="text-xl font-bold text-gray-900">View Balance</h3>
          </div>

          <div className={`flex justify-center gap-6 mb-8 ${isShake ? 'animate-shake' : ''}`}>
             {[0,1,2,3].map(i => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i ? 'bg-indigo-600 border-indigo-600 scale-125' : 'bg-gray-100 border-gray-300'}`}></div>
             ))}
          </div>

          {error && <p className="text-center text-red-500 font-bold text-sm mb-4">{error}</p>}

          <div className="bg-gray-50 -mx-6 pb-6 pt-2 border-t border-gray-100">
             <Numpad 
                theme="light"
                onInput={(n) => { if(pin.length < 4) setPin(prev => prev + n); setError(''); }}
                onDelete={() => setPin(prev => prev.slice(0, -1))}
             />
             <div className="px-6">
                <Button fullWidth onClick={handlePinSubmit} disabled={pin.length !== 4 || isProcessing}>
                   {isProcessing ? 'Verifying...' : 'Verify PIN'}
                </Button>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <>
      {renderDesktop()}
      {renderMobile()}
    </>
  );
};

// --- Quick Send Overlay Component ---
interface QuickSendOverlayProps {
  contact: Contact;
  user: User;
  onClose: () => void;
  onSuccess: (amount: number) => Promise<void>;
}

const QuickSendOverlay: React.FC<QuickSendOverlayProps> = ({ contact, user, onClose, onSuccess }) => {
  const [step, setStep] = useState<'AMOUNT' | 'PIN' | 'PROCESSING' | 'SUCCESS'>('AMOUNT');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShake, setIsShake] = useState(false);

  // Refs for focusing
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const desktopPinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus logic for desktop
    if (window.innerWidth >= 768) {
      if (step === 'AMOUNT') {
         // Small delay to ensure render
         setTimeout(() => desktopInputRef.current?.focus(), 50);
      } else if (step === 'PIN') {
         setTimeout(() => desktopPinRef.current?.focus(), 50);
      }
    }
  }, [step]);

  // Amount Handlers
  const handleAmountSubmit = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
       setError('Enter amount');
       return;
    }
    if (val > user.balance) {
       setError('Insufficient funds');
       return;
    }
    setError('');
    setStep('PIN');
  };

  // PIN Handlers
  const handlePinSubmit = () => {
     if (pin.length !== 4) return;
     if (pin !== user.upiPin) {
        setError('Incorrect PIN');
        setPin('');
        setIsShake(true);
        setTimeout(() => setIsShake(false), 500);
        return;
     }
     setError('');
     setStep('PROCESSING');
     onSuccess(parseFloat(amount))
       .then(() => setStep('SUCCESS'))
       .catch(() => {
         setError('Payment Failed');
         setStep('AMOUNT');
       })
       .finally(() => {
          if (step === 'SUCCESS') setTimeout(onClose, 800);
       });
  };

  // Close logic
  useEffect(() => {
    if (step === 'SUCCESS') {
       const t = setTimeout(onClose, 2000);
       return () => clearTimeout(t);
    }
  }, [step, onClose]);

  // Global Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
       if (e.key === 'Escape') onClose();
       if (step === 'AMOUNT' && e.key === 'Enter') handleAmountSubmit();
       if (step === 'PIN' && e.key === 'Enter') handlePinSubmit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step, amount, pin]);

  // --- RENDERERS ---

  // 1. DESKTOP VIEW (Floating Compact Modal)
  const renderDesktop = () => (
    <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center">
       {/* Subtle Backdrop */}
       <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px] animate-fade-in" onClick={onClose}></div>
       
       {/* Card */}
       <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl border border-gray-100 p-8 animate-scale-in">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full ${contact.avatarColor} flex items-center justify-center font-bold text-lg shadow-sm`}>
                   {contact.name.charAt(0)}
                </div>
                <div>
                   <p className="font-bold text-gray-900 text-base leading-tight">Paying {contact.name.split(' ')[0]}</p>
                   <p className="text-xs text-gray-400 font-mono mt-0.5">{contact.upiId}</p>
                </div>
             </div>
             <button onClick={onClose} className="p-2 -mr-2 -mt-2 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-50 transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>

          {/* Body */}
          <div className="min-h-[220px] flex flex-col">
             {step === 'AMOUNT' && (
                <div className="flex flex-col flex-1">
                   <div className="relative mb-6">
                      <span className={`absolute top-1/2 -translate-y-1/2 text-3xl font-bold transition-colors ${amount ? 'text-gray-900' : 'text-gray-300'}`}>₹</span>
                      <input 
                        ref={desktopInputRef}
                        type="number"
                        className="w-full pl-8 text-5xl font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-200"
                        placeholder="0"
                        value={amount}
                        onKeyDown={(e) => {
                            // Block invalid keys
                            if (["-", "+", "e", "E"].includes(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        onChange={(e) => {
                           let val = e.target.value;
                           // Sanitize input
                           val = val.replace(/[-+eE]/g, '');
                           if(val.length < 8) {
                              setAmount(val);
                              setError('');
                           }
                        }}
                        min="0"
                      />
                      <p className="text-xs font-medium text-gray-400 mt-2 pl-1">
                        Balance: {formatCurrency(user.balance)}
                      </p>
                   </div>
                   
                   <div className="flex gap-2 mb-8">
                      {[100, 500, 2000].map(val => (
                         <button 
                           key={val}
                           onClick={() => { setAmount(val.toString()); setError(''); desktopInputRef.current?.focus(); }}
                           className="px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 text-xs font-bold rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                         >
                            + ₹{val}
                         </button>
                      ))}
                   </div>
                   
                   {error && <p className="text-red-500 text-sm font-medium mb-4 animate-shake">{error}</p>}
                   
                   <div className="mt-auto">
                      <Button fullWidth onClick={handleAmountSubmit} disabled={!amount} className="shadow-lg shadow-indigo-100">
                         Continue
                      </Button>
                   </div>
                </div>
             )}

             {step === 'PIN' && (
                <div className="flex flex-col flex-1 animate-slide-up">
                   
                   {/* Clean Light Summary */}
                   <div className="text-center mb-6">
                     <p className="text-gray-500 text-sm mb-1">Paying Amount</p>
                     <p className="text-3xl font-bold text-gray-900 tracking-tight">₹{amount}</p>
                   </div>

                   {/* Desktop Inline PIN */}
                   <div className="flex-1 flex flex-col items-center justify-center mb-4">
                      <p className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-indigo-600" /> Enter 4-digit UPI PIN
                      </p>
                      
                      <div className={`flex gap-4 mb-4 ${isShake ? 'animate-shake' : ''}`}>
                         {[0,1,2,3].map(i => {
                            const isFilled = pin.length > i;
                            const isActive = pin.length === i;
                            return (
                               <div key={i} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                                  isActive ? 'border-indigo-600 bg-indigo-50 shadow-md ring-2 ring-indigo-100' :
                                  isFilled ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white'
                               }`}>
                                  {isFilled ? '•' : ''}
                               </div>
                            )
                         })}
                      </div>

                      {/* Hidden Input for Focus */}
                      <input 
                         ref={desktopPinRef}
                         type="password"
                         maxLength={4}
                         className="opacity-0 absolute w-0 h-0"
                         value={pin}
                         onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setPin(val);
                            setError('');
                         }}
                         onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                      />
                      
                      {error && <p className="text-red-500 text-xs font-bold mt-2 animate-fade-in">{error}</p>}
                   </div>

                   <div className="mt-auto pt-4">
                      <Button fullWidth onClick={handlePinSubmit} disabled={pin.length !== 4}>
                         Pay Securely
                      </Button>
                      <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Encrypted</span>
                      </div>
                   </div>
                </div>
             )}

             {(step === 'PROCESSING' || step === 'SUCCESS') && (
                <div className="flex flex-col flex-1 items-center justify-center animate-fade-in text-center">
                   {step === 'PROCESSING' ? (
                      <>
                         <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                         <h3 className="text-lg font-bold text-gray-900">Processing...</h3>
                      </>
                   ) : (
                      <>
                         <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200 mb-4 animate-pop">
                            <CheckCircle2 className="w-8 h-8" />
                         </div>
                         <h3 className="text-xl font-bold text-gray-900">Paid ₹{amount}</h3>
                         <p className="text-sm text-gray-500 mt-1">to {contact.name}</p>
                      </>
                   )}
                </div>
             )}
          </div>
       </div>
    </div>
  );

  // 2. MOBILE VIEW (Bottom Sheet)
  const renderMobile = () => (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
       {/* Backdrop */}
       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
       
       {/* Sheet */}
       <div className="relative bg-white w-full rounded-t-[2rem] p-6 pb-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slide-up overflow-hidden">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-6 relative z-10">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-6"></div>
             
             <div className="flex items-center gap-3 bg-gray-50 p-2 pr-4 rounded-full border border-gray-100">
                <div className={`w-8 h-8 rounded-full ${contact.avatarColor} flex items-center justify-center font-bold text-sm`}>
                   {contact.name.charAt(0)}
                </div>
                <span className="font-bold text-gray-900 text-sm">Paying {contact.name.split(' ')[0]}</span>
             </div>
          </div>

          {step === 'AMOUNT' && (
             <div className="flex flex-col">
                <div className="flex justify-center items-baseline mb-8">
                   <span className={`text-4xl font-bold mr-1 ${amount ? 'text-gray-900' : 'text-gray-300'}`}>₹</span>
                   <span className={`text-6xl font-bold tracking-tighter ${amount ? 'text-gray-900' : 'text-gray-300'}`}>
                      {amount || '0'}
                   </span>
                </div>
                
                {/* Quick Chips */}
                <div className="flex justify-center gap-3 mb-6">
                   {[100, 500, 1000].map(val => (
                      <button 
                        key={val}
                        onClick={() => { setAmount(val.toString()); setError(''); }}
                        className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-full active:bg-indigo-50 active:text-indigo-600 transition-colors"
                      >
                         +₹{val}
                      </button>
                   ))}
                </div>

                {error && <p className="text-center text-red-500 font-medium text-sm mb-4 animate-shake">{error}</p>}
                
                <div className="bg-gray-50 -mx-6 pb-6 pt-2 border-t border-gray-100">
                   <div className="px-6 mb-2">
                      <Button fullWidth onClick={handleAmountSubmit} disabled={!amount} className="shadow-lg">
                         Pay ₹{amount || '0'}
                      </Button>
                   </div>
                   <Numpad 
                      onInput={(n) => { if(amount.length < 7) setAmount(prev => prev + n); setError(''); }}
                      onDelete={() => setAmount(prev => prev.slice(0, -1))}
                      extraKey="."
                      onExtraKey={() => !amount.includes('.') && setAmount(prev => prev + '.')}
                   />
                </div>
             </div>
          )}

          {step === 'PIN' && (
             <div className="flex flex-col animate-slide-up pb-8">
                {/* Mobile PIN Light Header */}
                <div className="text-center mb-6">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1 mb-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-500" /> Secure Payment
                   </p>
                   <h2 className="text-3xl font-bold text-gray-900">₹{amount}</h2>
                </div>

                <div className={`flex justify-center gap-6 mb-8 mt-2 ${isShake ? 'animate-shake' : ''}`}>
                   {[0,1,2,3].map(i => (
                      <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i ? 'bg-indigo-600 border-indigo-600 scale-125' : 'bg-gray-100 border-gray-300'}`}></div>
                   ))}
                </div>
                
                {error && <p className="text-center text-red-500 font-bold text-sm mb-4">{error}</p>}

                <div className="bg-white -mx-6 pb-6 pt-2">
                   <Numpad 
                      theme="light"
                      onInput={(n) => { if(pin.length < 4) setPin(prev => prev + n); setError(''); }}
                      onDelete={() => setPin(prev => prev.slice(0, -1))}
                   />
                   
                   <div className="px-6">
                      <Button fullWidth onClick={handlePinSubmit} disabled={pin.length !== 4} className="mt-2">
                         Confirm & Pay
                      </Button>
                   </div>
                </div>
             </div>
          )}

          {(step === 'PROCESSING' || step === 'SUCCESS') && (
             <div className="h-[300px] flex flex-col items-center justify-center">
                {step === 'PROCESSING' ? (
                   <>
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                      <h3 className="font-bold text-gray-900">Processing Payment...</h3>
                   </>
                ) : (
                   <div className="text-center animate-pop">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-200 mx-auto mb-4">
                         <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Paid Successfully!</h3>
                   </div>
                )}
             </div>
          )}
       </div>
    </div>
  );

  return (
    <>
      {renderDesktop()}
      {renderMobile()}
    </>
  );
};

// --- Sub-components ---

const QuickAction: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; color: string }> = ({ icon, label, onClick, color }) => (
  <button 
    onClick={onClick} 
    className="flex flex-col items-center gap-3 group w-full"
  >
    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${color} flex items-center justify-center transition-transform duration-200 group-hover:scale-105 group-active:scale-95 shadow-sm`}>
      {icon}
    </div>
    <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
  </button>
);

const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const isCredit = tx.type === TransactionType.CREDIT;
  const isFailed = tx.status === TransactionStatus.FAILED;

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors group">
       <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
             isFailed ? 'bg-red-50 text-red-500' :
             isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
          }`}>
             {isFailed ? <Shield className="w-5 h-5" /> : 
              isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
          </div>
          <div>
             <h4 className="font-bold text-gray-900 text-sm md:text-base">{tx.payeeName}</h4>
             <p className="text-xs text-gray-500 font-medium">
               {new Date(tx.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
             </p>
          </div>
       </div>
       <div className="text-right">
          <p className={`font-bold text-sm md:text-base ${
             isFailed ? 'text-gray-400 line-through' : 
             isCredit ? 'text-emerald-600' : 'text-gray-900'
          }`}>
             {isCredit ? '+' : '-'} {formatCurrency(tx.amount)}
          </p>
          {isFailed && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide">Failed</span>}
       </div>
    </div>
  );
};

const EmptyState: React.FC<{ onAction: () => void }> = ({ onAction }) => (
   <div className="flex flex-col items-center justify-center py-10 bg-white rounded-[2rem] border border-gray-100 border-dashed">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
         <Banknote className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-gray-900 font-bold text-sm">No transactions yet</p>
      <p className="text-gray-400 text-xs mb-4">Start using NovaPay for your daily payments</p>
      <Button variant="outline" className="!py-2 !px-4 !text-xs !rounded-lg" onClick={onAction}>
         Send First Payment
      </Button>
   </div>
);