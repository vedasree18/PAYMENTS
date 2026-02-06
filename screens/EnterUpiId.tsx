import React, { useState, useEffect, useRef } from 'react';
import { Screen, User } from '../types';
import { DesktopHeader, MobileBottomNav } from '../components/Navigation';
import { Button } from '../components/Button';
import { ChevronLeft, ShieldCheck, AlertCircle, Loader2, User as UserIcon, CheckCircle2, AtSign, Info } from 'lucide-react';

interface EnterUpiIdProps {
  onBack: () => void;
  onContinue: (upiId: string, name: string) => void;
  user: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
}

export const EnterUpiId: React.FC<EnterUpiIdProps> = ({ onBack, onContinue, user, onNavigate, onLogout }) => {
  const [upiId, setUpiId] = useState('');
  const [isValidFormat, setIsValidFormat] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount for desktop
  useEffect(() => {
    if (window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
  }, []);

  // Real-time validation
  useEffect(() => {
    // Basic UPI regex: username@bank
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    const valid = upiRegex.test(upiId);
    setIsValidFormat(valid);
    
    if (valid) {
      setError('');
      // Simulate verification after a pause when format is valid
      const timer = setTimeout(() => verifyRecipient(upiId), 800);
      return () => clearTimeout(timer);
    } else {
      setVerifiedName(null);
      setIsVerifying(false);
    }
  }, [upiId]);

  const verifyRecipient = (id: string) => {
    setIsVerifying(true);
    // Mock API Verification
    setTimeout(() => {
      setIsVerifying(false);
      // Simulate a found user based on ID
      if (id.includes('error')) {
        setError('UPI ID not found');
        setVerifiedName(null);
      } else {
        // Generate a mock name
        const namePart = id.split('@')[0];
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, ' ');
        setVerifiedName(formattedName);
      }
    }, 1000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isValidFormat && verifiedName) {
      onContinue(upiId, verifiedName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <DesktopHeader currentScreen={Screen.ENTER_UPI_ID} onNavigate={onNavigate} user={user} onLogout={onLogout} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-0 md:p-8 lg:p-12">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100">
           <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
             <ChevronLeft className="w-6 h-6 text-gray-900" />
           </button>
           <h1 className="text-lg font-bold text-gray-900">Pay via UPI ID</h1>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-12 gap-8 lg:gap-16 h-full">
            
            {/* LEFT COLUMN: PRIMARY INPUT */}
            <div className="col-span-12 lg:col-span-7 flex flex-col pt-6 px-6 md:px-0">
               <div className="hidden md:block mb-8">
                  <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium mb-6">
                     <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Pay via UPI ID</h1>
                  <p className="text-lg text-gray-500">Enter the recipient’s UPI ID to continue securely.</p>
               </div>

               <div className="bg-white md:bg-transparent rounded-2xl md:rounded-none p-6 md:p-0 shadow-sm md:shadow-none border border-gray-100 md:border-none">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 ml-1">Recipient UPI ID</label>
                  
                  <div className="relative group mb-2">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <AtSign className="w-5 h-5" />
                     </div>
                     <input
                        ref={inputRef}
                        type="text"
                        placeholder="example@bank"
                        className={`w-full pl-12 pr-4 py-4 text-xl md:text-2xl font-medium bg-white border-2 rounded-xl outline-none transition-all placeholder:text-gray-300 ${
                           error 
                             ? 'border-red-300 focus:border-red-500 text-red-600' 
                             : isValidFormat 
                               ? 'border-green-500 focus:border-green-600' 
                               : 'border-gray-200 focus:border-indigo-600'
                        }`}
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value.trim())}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        autoCapitalize="none"
                        autoCorrect="off"
                     />
                     {isValidFormat && !isVerifying && !error && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-fade-in">
                           <CheckCircle2 className="w-6 h-6 fill-green-100" />
                        </div>
                     )}
                     {isVerifying && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                           <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        </div>
                     )}
                  </div>

                  {/* Feedback Area */}
                  <div className="min-h-[60px] mb-8">
                     {error ? (
                        <div className="flex items-center gap-2 text-red-600 text-sm font-medium animate-slide-up mt-2">
                           <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                     ) : verifiedName ? (
                        <div className="flex items-center gap-3 bg-green-50 p-3 rounded-xl border border-green-100 animate-slide-up mt-2">
                           <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold">
                              {verifiedName.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-900">{verifiedName}</p>
                              <div className="flex items-center gap-1 text-xs text-green-700">
                                 <ShieldCheck className="w-3 h-3" /> Verified Name
                              </div>
                           </div>
                        </div>
                     ) : (
                        <p className="text-sm text-gray-400 mt-2 ml-1">
                           {upiId.length > 0 && !isValidFormat ? 'Typing...' : ''}
                        </p>
                     )}
                  </div>

                  {/* Desktop CTA */}
                  <div className="hidden md:block">
                     <Button 
                        onClick={() => handleSubmit()}
                        disabled={!isValidFormat || !verifiedName || isVerifying}
                        fullWidth
                        className="py-4 text-lg"
                     >
                        Continue
                     </Button>
                  </div>
               </div>
            </div>

            {/* RIGHT COLUMN: HELP & INFO (Desktop Only) */}
            <div className="hidden md:flex col-span-12 lg:col-span-5 flex-col gap-6 pt-12 pl-8">
               
               {/* Format Help */}
               <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                     <Info className="w-5 h-5 text-indigo-500" /> UPI ID Format
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                     A UPI ID serves as a unique identifier for bank accounts. It typically looks like an email address.
                  </p>
                  
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="font-mono text-gray-600 text-sm">mobile@upi</span>
                        <span className="text-xs text-gray-400 ml-auto">Common</span>
                     </div>
                     <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="font-mono text-gray-600 text-sm">name@bankname</span>
                        <span className="text-xs text-gray-400 ml-auto">Bank specific</span>
                     </div>
                  </div>
               </div>

               {/* Safety Tip */}
               <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
                  <div className="flex gap-4">
                     <div className="p-2 bg-blue-100 rounded-lg h-fit">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                     </div>
                     <div>
                        <h4 className="font-bold text-blue-900 mb-1">Verify before paying</h4>
                        <p className="text-sm text-blue-800/80 leading-relaxed">
                           Always check the "Verified Name" that appears after entering the ID to ensure you are sending money to the right person.
                        </p>
                     </div>
                  </div>
               </div>

            </div>

        </div>

        {/* Mobile Sticky CTA */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20">
            <Button 
               onClick={() => handleSubmit()}
               disabled={!isValidFormat || !verifiedName || isVerifying}
               fullWidth
               className="py-4 text-lg shadow-lg"
            >
               Continue
            </Button>
        </div>

      </main>

      <MobileBottomNav currentScreen={Screen.ENTER_UPI_ID} onNavigate={onNavigate} />
    </div>
  );
};