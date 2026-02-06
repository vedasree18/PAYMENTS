import React, { useState, useEffect } from 'react';
import { User, Screen } from '../types';
import { Numpad } from '../components/Numpad';
import { DesktopHeader } from '../components/Navigation';
import { Lock, AlertCircle, Check, Building2, ChevronLeft, ShieldCheck, RefreshCw, X, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import { Button } from '../components/Button';

interface CheckBalanceProps {
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout?: () => void;
}

type Step = 'PIN' | 'PROCESSING' | 'RESULT';

export const CheckBalance: React.FC<CheckBalanceProps> = ({ user, onNavigate, onLogout }) => {
  const [step, setStep] = useState<Step>('PIN');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShake, setIsShake] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handlePinBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const submitPin = () => {
    if (pin.length !== 4) return;
    
    if (pin !== user.upiPin) {
      setIsShake(true);
      setError('Incorrect PIN');
      setPin('');
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      setTimeout(() => setIsShake(false), 500);
      return;
    }

    setStep('PROCESSING');
    
    // Simulate API call to fetch fresh balance
    setTimeout(() => {
      setBalance(user.balance);
      setStep('RESULT');
    }, 1500);
  };

  // --- Keyboard support ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step !== 'PIN') return;
      
      const key = e.key;
      if (/^[0-9]$/.test(key)) handlePinInput(key);
      else if (key === 'Backspace') handlePinBackspace();
      else if (key === 'Enter') submitPin();
      else if (key === 'Escape') onNavigate(Screen.DASHBOARD);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, pin, onNavigate]);

  // ==========================================
  // MOBILE RENDER (Original Modal Design)
  // ==========================================
  const renderMobile = () => (
    <div className="md:hidden fixed inset-0 z-50 flex items-center justify-center">
       <div className={`w-full h-full bg-slate-950 flex flex-col relative transition-all duration-300 ${step !== 'PIN' ? 'bg-white' : ''}`}>
          
          {step === 'PIN' && (
            <>
              {/* Background Effects */}
              <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="flex items-center justify-between p-6 z-10">
                <button onClick={() => onNavigate(Screen.DASHBOARD)} className="text-slate-400 text-sm font-medium flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Cancel
                </button>
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Secure</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 animate-fade-in">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-2xl border border-slate-700/50">
                  <Building2 className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-white tracking-tight">Check Bank Balance</h2>
                <div className="flex flex-col items-center mb-10">
                  <p className="text-slate-400 text-sm">Enter UPI PIN for</p>
                  <div className="flex items-center gap-2 mt-2 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                    <span className="text-slate-300 font-mono text-xs tracking-wide">{user.upiId}</span>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-sm w-full max-w-[320px]">
                  <div className="flex justify-center gap-6">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-white border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-slate-800 border-slate-600'} ${error ? 'border-red-500 bg-red-500/20' : ''} ${isShake ? 'animate-shake' : ''}`} />
                    ))}
                  </div>
                </div>
                
                <div className="h-12 mt-6 flex items-center justify-center">
                  {error ? (
                     <p className="text-red-400 text-sm font-medium animate-fade-in flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20"><AlertCircle className="w-3.5 h-3.5" /> {error}</p>
                  ) : (
                     <p className="text-slate-500 text-xs flex items-center gap-1.5 bg-slate-800/30 px-3 py-1.5 rounded-full"><Lock className="w-3 h-3 text-slate-400" /> Your PIN is never stored</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-950 pb-4 relative z-20">
                 <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-4"></div>
                 <Numpad theme="dark" onInput={handlePinInput} onDelete={handlePinBackspace} />
                 <div className="px-6 pb-6 pt-2">
                   <button onClick={submitPin} disabled={pin.length !== 4} className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg duration-300 ${pin.length === 4 ? 'bg-indigo-600 text-white shadow-indigo-900/50' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                     {pin.length === 4 ? <Check className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                     {pin.length === 4 ? 'Submit PIN' : 'Enter 4 Digits'}
                   </button>
                 </div>
              </div>
            </>
          )}

          {step === 'PROCESSING' && (
             <div className="flex-1 flex flex-col items-center justify-center animate-fade-in p-6">
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-indigo-100 rounded-full animate-spin"></div>
                  <div className="w-24 h-24 border-4 border-indigo-600 rounded-full animate-spin absolute top-0 left-0 border-t-transparent border-b-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center"><Building2 className="w-8 h-8 text-indigo-600" /></div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Fetching Balance</h2>
                <p className="text-sm text-gray-500">Securely communicating with bank...</p>
             </div>
          )}

          {step === 'RESULT' && balance !== null && (
             <div className="flex-1 flex flex-col items-center pt-20 px-6 animate-fade-in relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-green-50 to-transparent z-0"></div>
                <button onClick={() => onNavigate(Screen.DASHBOARD)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full text-gray-500 z-20"><X className="w-5 h-5" /></button>
                <div className="relative z-10 flex flex-col items-center w-full">
                   <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pop shadow-lg shadow-green-100"><Check className="w-10 h-10 text-green-600" /></div>
                   <h2 className="text-gray-500 font-medium mb-1 text-sm uppercase tracking-wide">Available Balance</h2>
                   <h1 className="text-5xl font-bold text-gray-900 mb-8 tracking-tight">{formatCurrency(balance)}</h1>
                   <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-xl shadow-gray-100/50 mb-12">
                     <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
                       <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center"><Building2 className="w-5 h-5 text-gray-400" /></div><div><p className="text-sm font-bold text-gray-900">HDFC Bank</p><p className="text-xs text-gray-500">Savings Account</p></div></div>
                       <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">•••• 4582</span>
                     </div>
                     <div className="flex justify-between items-center"><span className="text-sm text-gray-500">UPI ID</span><span className="text-sm font-mono text-gray-600">{user.upiId}</span></div>
                   </div>
                   <Button fullWidth onClick={() => onNavigate(Screen.DASHBOARD)}>Done</Button>
                </div>
             </div>
          )}
       </div>
    </div>
  );

  // ==========================================
  // DESKTOP RENDER (Redesigned Split Layout)
  // ==========================================
  const renderDesktop = () => (
    <div className="hidden md:flex flex-col min-h-screen bg-gray-50 font-sans">
      <DesktopHeader currentScreen={Screen.DASHBOARD} onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-8 lg:p-12 grid grid-cols-12 gap-12 lg:gap-20 items-start">
        
        {/* LEFT COLUMN: INTERACTION */}
        <div className="col-span-12 lg:col-span-7 flex flex-col pt-8">
           
           {/* Breadcrumb/Back */}
           <div className="mb-8">
              <button 
                onClick={() => onNavigate(Screen.DASHBOARD)} 
                className="group flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium transition-colors"
              >
                <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <span>Back to Dashboard</span>
              </button>
           </div>

           {/* MAIN CONTENT AREA */}
           <div className="flex flex-col">
              
              {/* Header Text */}
              <div className="mb-12">
                 <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                    {step === 'RESULT' ? 'Account Balance' : 'Check Balance'}
                 </h1>
                 <p className="text-lg text-gray-500 max-w-md leading-relaxed">
                    {step === 'RESULT' 
                       ? "Here is the current available balance for your primary account."
                       : "Enter your 4-digit UPI PIN to securely fetch your latest bank balance."
                    }
                 </p>
              </div>

              {/* DYNAMIC INTERACTION ZONE */}
              <div className="min-h-[300px]">
                {step === 'PIN' && (
                   <div className="flex flex-col items-start animate-fade-in">
                      <label className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6 block">
                        Enter UPI PIN
                      </label>
                      
                      <div className={`flex gap-6 mb-8 ${isShake ? 'animate-shake' : ''}`}>
                         {[0, 1, 2, 3].map((i) => {
                            const isFilled = pin.length > i;
                            const isActive = pin.length === i;
                            return (
                               <div 
                                 key={i} 
                                 className={`
                                   w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold transition-all duration-200
                                   ${isActive 
                                      ? 'border-indigo-600 bg-white ring-4 ring-indigo-100 shadow-xl scale-105 z-10' 
                                      : isFilled 
                                        ? 'border-gray-900 bg-gray-50 text-gray-900' 
                                        : 'border-gray-200 bg-white text-transparent'
                                   }
                                   ${error ? '!border-red-500 !bg-red-50' : ''}
                                 `}
                               >
                                  {isFilled ? '•' : ''}
                               </div>
                            );
                         })}
                      </div>

                      <div className="h-6 mb-8 flex items-center">
                         {error && (
                            <div className="flex items-center gap-2 text-red-600 font-medium animate-slide-up">
                               <AlertCircle className="w-5 h-5" /> {error}
                            </div>
                         )}
                      </div>

                      <div className="flex items-center gap-3 text-gray-400 text-sm bg-gray-100/50 px-4 py-3 rounded-xl border border-gray-200/50">
                          <div className="flex gap-1">
                             <div className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center text-[10px] shadow-sm">1</div>
                             <div className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center text-[10px] shadow-sm">2</div>
                             <div className="w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center text-[10px] shadow-sm">3</div>
                          </div>
                          <span>Use keyboard to type</span>
                      </div>
                   </div>
                )}

                {step === 'PROCESSING' && (
                   <div className="flex flex-col items-start pt-10 animate-fade-in">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                         <span className="text-xl font-bold text-gray-900">Verifying credentials...</span>
                      </div>
                      <p className="text-gray-500">Communicating with HDFC Bank secure gateway.</p>
                   </div>
                )}

                {step === 'RESULT' && balance !== null && (
                   <div className="animate-slide-up w-full">
                      <div className="flex items-baseline gap-2 mb-2">
                         <span className="text-2xl text-gray-400 font-medium">₹</span>
                         <span className="text-7xl font-bold text-gray-900 tracking-tighter">
                            {balance.toLocaleString('en-IN')}
                         </span>
                         <span className="text-2xl text-gray-400 font-medium">.00</span>
                      </div>
                      
                      <div className="mt-12 flex gap-4">
                         <Button onClick={() => onNavigate(Screen.DASHBOARD)}>
                            Back to Dashboard
                         </Button>
                         <button 
                           onClick={() => { setStep('PIN'); setPin(''); setBalance(null); }}
                           className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                         >
                            <RefreshCw className="w-4 h-4" /> Check Another
                         </button>
                      </div>
                   </div>
                )}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: INFO & SECURITY */}
        <div className="col-span-12 lg:col-span-5 pt-8 space-y-6">
           
           {/* Account Card */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Building2 className="w-7 h-7" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-900">HDFC Bank</h3>
                    <p className="text-sm text-gray-500">Savings Account •• 4582</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500">UPI ID</span>
                    <span className="text-sm font-mono font-bold text-gray-900">{user.upiId}</span>
                 </div>
                 <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                       <span className="text-sm font-bold text-gray-900">Active</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Security Panel */}
           <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"></div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                     <ShieldCheck className="w-6 h-6 text-emerald-400" />
                     <span className="text-sm font-bold tracking-widest text-indigo-200 uppercase">Security First</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4">Your PIN is encrypted</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                     NovaPay does not store your UPI PIN. It is securely transmitted directly to your bank for verification using standard UPI protocols.
                  </p>
                  
                  <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                     <Lock className="w-5 h-5 text-indigo-300 mt-0.5 shrink-0" />
                     <div>
                        <p className="text-sm font-semibold text-white">Never share your PIN</p>
                        <p className="text-xs text-indigo-200 mt-1">Bank officials will never ask for your PIN.</p>
                     </div>
                  </div>
               </div>
           </div>

        </div>

      </main>
    </div>
  );

  return (
    <>
      {renderMobile()}
      {renderDesktop()}
    </>
  );
};