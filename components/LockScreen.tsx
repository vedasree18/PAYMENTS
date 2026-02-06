import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ShieldCheck, Fingerprint, Lock, LogOut, Delete } from 'lucide-react';

interface LockScreenProps {
  user: User;
  onUnlock: () => void;
  onLogout: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ user, onUnlock, onLogout }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShake, setIsShake] = useState(false);

  // Auto-submit when pin reaches 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === user.upiPin) {
        onUnlock();
      } else {
        setError('Incorrect PIN');
        setIsShake(true);
        setPin('');
        // Vibrate on error if supported
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        setTimeout(() => setIsShake(false), 500);
      }
    }
  }, [pin, user.upiPin, onUnlock]);

  const handleNum = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
      if (navigator.vibrate) navigator.vibrate(40);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
    if (navigator.vibrate) navigator.vibrate(40);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden no-invert">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

        <div className="relative z-10 w-full max-w-sm flex flex-col items-center p-6">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-slate-700">
                <Lock className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-slate-400 mb-8">Enter UPI PIN to unlock NovaPay</p>

            <div className={`flex gap-6 mb-10 ${isShake ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                    pin.length > i ? 'bg-white border-white scale-110 animate-pop' : 'bg-transparent border-slate-600'
                  } ${error ? 'border-red-500' : ''}`}
                />
              ))}
            </div>

            {error && <p className="text-red-400 font-medium mb-6 animate-pulse text-sm">{error}</p>}

            <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNum(num.toString())}
                        className="w-16 h-16 rounded-full bg-slate-800/50 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-2xl font-medium transition-colors"
                    >
                        {num}
                    </button>
                ))}
                
                <button 
                  onClick={onLogout}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                    <LogOut className="w-6 h-6" />
                </button>
                
                <button
                    onClick={() => handleNum('0')}
                    className="w-16 h-16 rounded-full bg-slate-800/50 hover:bg-white/10 active:bg-white/20 flex items-center justify-center text-2xl font-medium transition-colors"
                >
                    0
                </button>
                
                <button 
                  onClick={handleBackspace}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
                >
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            {user.preferences.security.biometric && (
                <button className="mt-10 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <Fingerprint className="w-6 h-6" />
                    <span className="text-sm font-medium">Use Biometric</span>
                </button>
            )}
        </div>
    </div>
  );
};