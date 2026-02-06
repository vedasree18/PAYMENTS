import React, { useState, useEffect, useRef } from 'react';
import { Screen, User, Transaction, TransactionStatus, PaymentContextState } from '../types';
import { formatCurrency } from '../utils';
import { ChevronLeft, ShieldCheck, Check, X, User as UserIcon, Edit2, Banknote, AlertCircle, ArrowRight, Wallet, RefreshCw, Lock, Keyboard, Building2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Numpad } from '../components/Numpad';
import { DesktopHeader } from '../components/Navigation';

interface PaymentFlowProps {
  user: User;
  paymentContext: PaymentContextState;
  setPaymentContext: (ctx: PaymentContextState) => void;
  onNavigate: (screen: Screen) => void;
  onConfirmPayment: () => void;
  currentScreen: Screen;
  activeTransaction: Transaction | null;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({ 
  user, paymentContext, setPaymentContext, onNavigate, onConfirmPayment, currentScreen, activeTransaction 
}) => {
  // --- STATE ---
  const [pin, setPin] = useState('');
  const [amountStr, setAmountStr] = useState(paymentContext.amount > 0 ? paymentContext.amount.toString() : '');
  const [error, setError] = useState('');
  const [isShake, setIsShake] = useState(false);
  const [keypadVisible, setKeypadVisible] = useState(true); // Only relevant for mobile
  const noteInputRef = useRef<HTMLInputElement>(null);
  
  // Reset logic when switching screens
  useEffect(() => {
    if (currentScreen === Screen.PAYMENT_AMOUNT) {
      setPin('');
      setError('');
      setKeypadVisible(true);
      // Ensure amount string matches context if coming back
      if (paymentContext.amount > 0) {
        setAmountStr(paymentContext.amount.toString());
      }
    } else if (currentScreen === Screen.PAYMENT_PIN) {
      setError('');
      setIsShake(false);
    }
  }, [currentScreen]);

  // Keep payment context in sync with local amount string
  useEffect(() => {
    if (currentScreen === Screen.PAYMENT_AMOUNT) {
      const num = parseFloat(amountStr);
      setPaymentContext({ ...paymentContext, amount: isNaN(num) ? 0 : num });
      if (error) setError('');
    }
  }, [amountStr]);


  // --- HANDLERS ---

  const handleAmountInput = (num: string) => {
    if (amountStr.length > 7) return; 
    if (num === '.' && amountStr.includes('.')) return;
    if (amountStr === '0' && num === '0') return;
    if (amountStr === '0' && num !== '.') {
      setAmountStr(num);
      return;
    }
    setAmountStr(prev => prev + num);
  };

  const handleAmountDelete = () => {
    setAmountStr(prev => prev.slice(0, -1));
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handlePinBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const validateAndProceed = () => {
    const val = parseFloat(amountStr);
    if (!val || val <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (val > user.balance) {
      setError('Insufficient balance');
      return;
    }
    if (val > user.preferences.payments.transactionLimit) {
      setError(`Max limit is ₹${user.preferences.payments.transactionLimit}`);
      return;
    }
    onNavigate(Screen.PAYMENT_PIN);
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
    onConfirmPayment();
  };

  // --- KEYBOARD SUPPORT ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // DESKTOP: If user is typing in a real input, ignore global numpad logic
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        if (e.key === 'Enter' && currentScreen === Screen.PAYMENT_AMOUNT) {
             (document.activeElement as HTMLElement).blur();
             validateAndProceed();
        }
        return;
      }

      // MOBILE / PIN SCREEN: Use global listener for custom UI
      const key = e.key;
      
      if (currentScreen === Screen.PAYMENT_AMOUNT) {
        if (/^[0-9]$/.test(key)) {
          handleAmountInput(key);
        } else if (key === 'Backspace') {
          handleAmountDelete();
        } else if (key === '.') {
          handleAmountInput('.');
        } else if (key === 'Enter') {
          validateAndProceed();
        }
      } else if (currentScreen === Screen.PAYMENT_PIN) {
        if (/^[0-9]$/.test(key)) {
          handlePinInput(key);
        } else if (key === 'Backspace') {
          handlePinBackspace();
        } else if (key === 'Enter') {
          submitPin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, amountStr, pin, user.balance]); 

  // --- RENDERERS ---

  // 1. AMOUNT ENTRY SCREEN
  if (currentScreen === Screen.PAYMENT_AMOUNT) {
    const isAmountValid = paymentContext.amount > 0 && paymentContext.amount <= user.balance && paymentContext.amount <= user.preferences.payments.transactionLimit;
    const isBalanceLow = paymentContext.amount > user.balance;

    return (
      <div className="flex flex-col min-h-screen bg-white md:bg-gray-50">
        <DesktopHeader currentScreen={currentScreen} onNavigate={onNavigate} user={user} />
        
        {/* ================================================= */}
        {/* MOBILE VIEW (< 768px)                             */}
        {/* ================================================= */}
        <div className="md:hidden flex-1 flex flex-col">
            <div className="p-4 flex items-center gap-4 bg-white sticky top-0 z-10">
              <button onClick={() => onNavigate(Screen.DASHBOARD)} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="w-6 h-6 text-gray-900" />
              </button>
              <h1 className="text-lg font-bold text-gray-900">Enter Amount</h1>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
              {/* Recipient Info */}
              <div className="flex flex-col items-center mb-10 animate-fade-in">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-2xl shadow-sm mb-4">
                  {paymentContext.recipientName.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{paymentContext.recipientName}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <span className="font-mono">{paymentContext.recipientUpiId}</span>
                  <ShieldCheck className="w-3 h-3 text-green-500" />
                </div>
              </div>

              {/* Display Area (Not an Input) */}
              <div className="flex flex-col items-center justify-center mb-10 w-full" onClick={() => setKeypadVisible(true)}>
                <div className="flex items-center justify-center relative">
                  <span className={`text-4xl font-bold mr-2 mb-2 ${amountStr ? 'text-gray-900' : 'text-gray-300'}`}>₹</span>
                  <div className="relative flex items-center">
                    <span className={`text-7xl font-bold tracking-tighter ${amountStr ? 'text-gray-900' : 'text-gray-300'}`}>
                      {amountStr || '0'}
                    </span>
                    {/* Blinking Cursor */}
                    <div className="w-1 h-16 bg-indigo-600 rounded-full animate-pulse ml-1 opacity-50"></div>
                  </div>
                </div>

                {/* Error / Balance */}
                <div className="h-8 mt-4 flex items-center justify-center">
                   {error ? (
                     <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold animate-shake">
                       <AlertCircle className="w-3 h-3" /> {error}
                     </div>
                   ) : (
                     <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isBalanceLow ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'}`}>
                       <Wallet className="w-3 h-3" />
                       <span className={isBalanceLow ? 'font-bold' : ''}>Bal: {formatCurrency(user.balance)}</span>
                     </div>
                   )}
                </div>
              </div>
              
              {/* Note Field */}
              <div className="w-full max-w-xs relative mb-20">
                  <input
                    ref={noteInputRef}
                    type="text"
                    placeholder="Add a note"
                    value={paymentContext.note}
                    onChange={(e) => setPaymentContext({...paymentContext, note: e.target.value})}
                    onFocus={() => setKeypadVisible(false)} 
                    onBlur={() => setKeypadVisible(true)}
                    className="w-full bg-gray-50 text-center py-3 px-8 rounded-xl text-sm outline-none focus:ring-1 focus:ring-indigo-200 transition-all text-gray-900"
                  />
                  <Edit2 className="w-3 h-3 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Keypad Sheet */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 z-30 ${keypadVisible ? 'translate-y-0' : 'translate-y-full'}`}>
              <div className="p-6 pb-2">
                  <button 
                    onClick={validateAndProceed}
                    disabled={!isAmountValid}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
                      isAmountValid 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 active:scale-[0.98]' 
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Pay {formatCurrency(paymentContext.amount || 0)} <ArrowRight className="w-5 h-5" />
                  </button>
              </div>
              <Numpad onInput={handleAmountInput} onDelete={handleAmountDelete} extraKey="." onExtraKey={() => handleAmountInput('.')} />
            </div>
            
            {!keypadVisible && (
               <div className="fixed bottom-6 right-6 z-20">
                  <button onClick={() => setKeypadVisible(true)} className="bg-indigo-600 text-white p-4 rounded-full shadow-lg"><Banknote /></button>
               </div>
            )}
        </div>

        {/* ================================================= */}
        {/* DESKTOP VIEW (>= 768px)                           */}
        {/* ================================================= */}
        <div className="hidden md:block flex-1 max-w-6xl mx-auto w-full p-8 lg:p-12">
           <div className="grid grid-cols-12 gap-12 h-full">
               
               {/* LEFT COLUMN (Input & Action) */}
               <div className="col-span-12 lg:col-span-7 flex flex-col pt-4">
                  <h1 className="text-3xl font-bold text-gray-900 mb-8">Enter Amount</h1>
                  
                  {/* Desktop Recipient Card */}
                  <div className="flex items-center gap-5 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-10">
                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-xl font-bold text-indigo-700 shadow-inner">
                        {paymentContext.recipientName.charAt(0)}
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-0.5">{paymentContext.recipientName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                           <span className="font-mono bg-gray-50 px-2 py-0.5 rounded text-gray-600">{paymentContext.recipientUpiId}</span>
                           <div className="flex items-center gap-1 text-emerald-600 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="w-3 h-3" /> Verified
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Desktop Amount Input */}
                  <div className="mb-8">
                     <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 ml-1">Amount to Pay</label>
                     <div className="relative group">
                        <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-5xl font-bold transition-colors ${amountStr ? 'text-gray-900' : 'text-gray-300'}`}>₹</span>
                        <input 
                          type="number"
                          value={amountStr}
                          onChange={(e) => {
                              let val = e.target.value;
                              // Sanitize input: Remove negative signs, e, E, and +
                              val = val.replace(/[-+eE]/g, '');
                              if (val.length > 9) return;
                              setAmountStr(val);
                          }}
                          onKeyDown={(e) => {
                              // Block invalid keys for currency
                              if (["-", "+", "e", "E"].includes(e.key)) {
                                  e.preventDefault();
                              }
                          }}
                          className="w-full pl-12 py-4 text-6xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-200 focus:border-indigo-600 outline-none transition-all placeholder:text-gray-200 no-spin-button"
                          placeholder="0"
                          autoFocus
                          min="0"
                        />
                     </div>
                     {/* Validation Feedback */}
                     <div className="h-8 mt-3">
                        {error ? (
                           <div className="flex items-center gap-2 text-red-600 font-medium animate-slide-up">
                              <AlertCircle className="w-4 h-4" /> {error}
                           </div>
                        ) : isBalanceLow ? (
                           <div className="flex items-center gap-2 text-red-600 font-medium animate-slide-up">
                              <AlertCircle className="w-4 h-4" /> Insufficient balance ({formatCurrency(user.balance)})
                           </div>
                        ) : null}
                     </div>
                  </div>

                  {/* Desktop Note Input */}
                  <div className="mb-12">
                     <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Add a Note</label>
                     <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all hover:border-gray-300">
                        <div className="p-2 bg-gray-100 rounded-lg">
                           <Edit2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <input 
                          type="text"
                          value={paymentContext.note}
                          onChange={(e) => setPaymentContext({...paymentContext, note: e.target.value})}
                          placeholder="What is this payment for?"
                          className="w-full bg-transparent outline-none font-medium text-gray-900 placeholder:text-gray-400 text-lg"
                        />
                     </div>
                  </div>

                  {/* Desktop CTA */}
                  <Button 
                     onClick={validateAndProceed}
                     disabled={!isAmountValid}
                     className={`py-5 text-xl rounded-2xl shadow-xl transition-all ${isAmountValid ? 'shadow-indigo-200 hover:-translate-y-1' : ''}`}
                     fullWidth
                  >
                     Proceed to Pay
                  </Button>
                  <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-2">
                      <Keyboard className="w-4 h-4" /> Press <span className="font-bold border border-gray-300 rounded px-1 text-gray-500">Enter</span> to proceed
                  </p>
               </div>

               {/* RIGHT COLUMN (Context & Quick Actions) */}
               <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 pt-4 lg:pl-8">
                  
                  {/* Balance Card */}
                  <div className="bg-[#1e1e2f] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-30 -mr-10 -mt-10 group-hover:opacity-40 transition-opacity duration-500"></div>
                     <div className="relative z-10">
                        <p className="text-indigo-200 font-medium text-sm mb-2 uppercase tracking-wide">Wallet Balance</p>
                        <h2 className="text-4xl font-bold tracking-tight">{formatCurrency(user.balance)}</h2>
                        <div className="mt-8 flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                              <Wallet className="w-5 h-5 text-white" />
                           </div>
                           <div className="flex-1">
                              <p className="text-sm font-bold">Primary Account</p>
                              <p className="text-xs text-indigo-300">HDFC Bank •• 4582</p>
                           </div>
                           <Check className="w-5 h-5 text-emerald-400" />
                        </div>
                     </div>
                  </div>

                  {/* Quick Amounts */}
                  <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                     <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-gray-400" /> Quick Select
                     </h3>
                     <div className="grid grid-cols-2 gap-3">
                        {[500, 1000, 2000, 5000].map(amt => (
                           <button
                             key={amt}
                             onClick={() => { setAmountStr(amt.toString()); setError(''); }}
                             className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                                amountStr === amt.toString()
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-[1.02]'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white'
                             }`}
                           >
                              ₹{amt.toLocaleString()}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Security Info */}
                  <div className="flex items-start gap-4 p-6 bg-indigo-50/50 rounded-[2rem] text-indigo-900 border border-indigo-100/50">
                     <div className="p-2 bg-indigo-100 rounded-full">
                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                     </div>
                     <div>
                        <p className="font-bold text-lg mb-1">Bank-grade Security</p>
                        <p className="text-sm text-indigo-700/80 leading-relaxed">
                           Your payment is processed securely using UPI with 256-bit encryption. Money is transferred instantly.
                        </p>
                     </div>
                  </div>

               </div>
           </div>
        </div>

        {/* Global Styles for Desktop Input */}
        <style>{`
          .no-spin-button::-webkit-inner-spin-button, 
          .no-spin-button::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
        `}</style>
      </div>
    );
  }

  // 2. PIN ENTRY SCREEN
  if (currentScreen === Screen.PAYMENT_PIN) {
    return (
      <>
        {/* ================================================= */}
        {/* MOBILE VIEW (< 768px)                             */}
        {/* ================================================= */}
        <div className="md:hidden flex flex-col min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="p-4 flex justify-between items-center text-slate-400">
               <button onClick={() => onNavigate(Screen.PAYMENT_AMOUNT)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-6 h-6" /></button>
               <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> UPI Security</span>
               <div className="w-8"></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full">
               <div className="flex flex-col items-center mb-10">
                   <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold mb-4 shadow-lg ring-1 ring-white/10">
                      {paymentContext.recipientName.charAt(0)}
                   </div>
                   <p className="text-slate-400 text-sm font-medium mb-1">Paying to</p>
                   <h2 className="text-xl font-bold text-white mb-1 text-center">{paymentContext.recipientName}</h2>
                   <p className="text-slate-500 font-mono text-xs">{paymentContext.recipientUpiId}</p>
               </div>
               
               <div className="text-4xl font-bold text-white tracking-tight mb-12">
                  {formatCurrency(paymentContext.amount)}
               </div>

               {/* PIN Dots */}
               <div className="flex flex-col items-center w-full">
                   <div className="flex justify-center gap-6 mb-8 w-full max-w-[280px]">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i ? 'bg-white scale-125 shadow-[0_0_12px_rgba(255,255,255,0.5)]' : 'bg-slate-800 ring-1 ring-slate-700'} ${isShake ? 'animate-shake' : ''}`} />
                      ))}
                   </div>
                   
                   {/* Feedback */}
                   <div className="h-8">
                     {error ? (
                        <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-500/10 px-4 py-1.5 rounded-full animate-pulse">
                           <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                     ) : (
                        <div className="text-slate-600 text-xs font-medium">Enter 4-digit UPI PIN</div>
                     )}
                   </div>
               </div>
            </div>

            {/* Numpad */}
            <div className="bg-slate-900 pb-6 pt-2 border-t border-white/5">
               <Numpad theme="dark" onInput={handlePinInput} onDelete={handlePinBackspace} />
               <div className="px-6">
                  <button 
                    onClick={submitPin} 
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                      pin.length === 4 
                        ? 'bg-indigo-600 text-white shadow-indigo-900/50 hover:bg-indigo-500 active:scale-[0.98]' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Confirm Payment <Check className="w-5 h-5" />
                  </button>
               </div>
            </div>
        </div>

        {/* ================================================= */}
        {/* DESKTOP VIEW (>= 768px)                           */}
        {/* ================================================= */}
        <div className="hidden md:flex flex-col min-h-screen bg-gray-50 font-sans">
            <DesktopHeader currentScreen={currentScreen} onNavigate={onNavigate} user={user} />
            
            <div className="flex-1 max-w-5xl mx-auto w-full p-12 grid grid-cols-12 gap-16 items-start pt-16">
                {/* Left Column: Form */}
                <div className="col-span-7">
                    <button onClick={() => onNavigate(Screen.PAYMENT_AMOUNT)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-medium mb-8">
                       <ChevronLeft className="w-4 h-4" /> Back to Amount
                    </button>
                    
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Confirm Payment</h1>
                    
                    {/* Payment Summary */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-bold text-xl border border-indigo-100">
                             {paymentContext.recipientName.charAt(0)}
                          </div>
                          <div>
                             <p className="text-sm font-medium text-gray-500">Paying to</p>
                             <p className="font-bold text-gray-900 text-lg leading-tight">{paymentContext.recipientName}</p>
                             <p className="text-xs text-gray-400 font-mono mt-0.5">{paymentContext.recipientUpiId}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-medium text-gray-500 mb-1">Amount</p>
                          <p className="text-3xl font-bold text-gray-900 tracking-tight">{formatCurrency(paymentContext.amount)}</p>
                       </div>
                    </div>

                    {/* Desktop PIN Input */}
                    <div className="bg-white p-10 rounded-[2rem] border border-gray-200 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                        
                        <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider mb-8">Enter 4-Digit UPI PIN</label>
                        
                        <div className={`flex gap-5 mb-8 ${isShake ? 'animate-shake' : ''}`}>
                            {[0, 1, 2, 3].map(i => {
                                const isActive = pin.length === i;
                                const isFilled = pin.length > i;
                                return (
                                    <div key={i} className={`w-16 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-bold transition-all duration-200 ${
                                        isActive 
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 scale-105 shadow-lg ring-4 ring-indigo-100' 
                                            : isFilled 
                                                ? 'border-gray-900 bg-gray-900 text-white' 
                                                : 'border-gray-200 bg-gray-50 text-transparent'
                                    }`}>
                                        {isFilled ? '•' : ''}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="h-6 mb-6">
                           {error && <p className="text-red-600 font-bold text-sm flex items-center gap-2 animate-slide-up"><AlertCircle className="w-4 h-4"/> {error}</p>}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                               <Keyboard className="w-4 h-4" /> Type PIN using keyboard
                            </p>
                            <Button onClick={submitPin} disabled={pin.length !== 4} className="!px-8">
                               Confirm <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Info */}
                <div className="col-span-5 space-y-6 pt-20">
                    <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
                        <div className="relative z-10">
                            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-6" />
                            <h3 className="text-xl font-bold mb-3">Bank-grade Security</h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-8">
                               Your UPI PIN is encrypted end-to-end. We do not store your PIN on our servers.
                            </p>
                            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                               <Lock className="w-5 h-5 text-emerald-300" />
                               <div>
                                  <p className="text-sm font-bold">Secure Environment</p>
                                  <p className="text-xs text-slate-400">Verified by NPCI</p>
                               </div>
                            </div>
                        </div>
                    </div>

                    {paymentContext.note && (
                        <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
                           <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2">Attached Note</p>
                           <p className="text-yellow-900 font-medium text-lg">"{paymentContext.note}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </>
    );
  }

  // 3. PROCESSING & RESULT (Fullscreen)
  if (currentScreen === Screen.PAYMENT_PROCESSING || currentScreen === Screen.PAYMENT_SUCCESS || currentScreen === Screen.PAYMENT_FAILED) {
     const isProcessing = currentScreen === Screen.PAYMENT_PROCESSING;
     const isSuccess = currentScreen === Screen.PAYMENT_SUCCESS;
     const tx = activeTransaction || { 
       amount: paymentContext.amount, 
       payeeName: paymentContext.recipientName, 
       id: 'PENDING', 
       timestamp: new Date(),
       status: isSuccess ? TransactionStatus.SUCCESS : TransactionStatus.FAILED
     };

     return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center overflow-hidden">
           {isProcessing && (
              <div className="text-center animate-fade-in">
                 <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <ShieldCheck className="w-12 h-12 text-indigo-600" />
                    </div>
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
                 <p className="text-gray-500">Securely transferring ₹{paymentContext.amount}...</p>
                 <div className="mt-8 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 inline-flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-3 h-3" /> do not close or back
                 </div>
              </div>
           )}

           {!isProcessing && (
              <div className="w-full max-w-md p-6 flex flex-col items-center animate-slide-up relative z-10">
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${isSuccess ? 'bg-green-500 text-white shadow-green-200' : 'bg-red-500 text-white shadow-red-200'}`}>
                    {isSuccess ? <Check className="w-12 h-12" /> : <X className="w-12 h-12" />}
                 </div>
                 
                 <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
                    {isSuccess ? 'Payment Successful' : 'Payment Failed'}
                 </h2>
                 <p className="text-gray-500 mb-10 text-center">
                    {new Date(tx.timestamp).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                 </p>

                 <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-8 mb-8 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    
                    <div className="text-center pb-8 border-b border-gray-100 mb-8">
                       <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">Amount Paid</p>
                       <p className="text-5xl font-bold text-gray-900 tracking-tight">{formatCurrency(tx.amount)}</p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between">
                          <span className="text-gray-500">Paid to</span>
                          <span className="font-bold text-gray-900">{tx.payeeName}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-gray-500">UPI ID</span>
                          <span className="font-mono text-gray-700 bg-gray-50 px-2 rounded">{paymentContext.recipientUpiId}</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-gray-500">Txn ID</span>
                          <span className="font-mono text-gray-700 text-sm">TXN{tx.id.substring(0, 8).toUpperCase()}</span>
                       </div>
                    </div>
                 </div>

                 <Button fullWidth onClick={() => onNavigate(Screen.DASHBOARD)} className="py-4 text-lg">
                    Done
                 </Button>

                 {!isSuccess && (
                    <button onClick={onConfirmPayment} className="mt-4 text-indigo-600 font-bold hover:underline flex items-center gap-2">
                       <RefreshCw className="w-4 h-4" /> Retry Payment
                    </button>
                 )}
              </div>
           )}
           
           {/* Background Decorations for Success/Fail */}
           {!isProcessing && (
              <>
                <div className={`absolute top-0 left-0 w-full h-64 ${isSuccess ? 'bg-gradient-to-b from-green-50' : 'bg-gradient-to-b from-red-50'} to-transparent z-0`}></div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-50 to-transparent z-0"></div>
              </>
           )}
        </div>
     );
  }

  return null;
};