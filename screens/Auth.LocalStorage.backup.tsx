import React, { useState } from 'react';
import { User, Screen } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Wallet, ShieldCheck, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

const DEFAULT_PREFERENCES = {
  notifications: {
    payment: true,
    promotional: false,
    failedTxn: true,
  },
  security: {
    appLock: true,
    biometric: false,
  },
  appearance: {
    darkMode: false,
  },
  payments: {
    transactionLimit: 50000,
    confirmPayment: true,
  }
};

export const Auth: React.FC<AuthProps> = ({ onLogin, onNavigate, currentScreen }) => {
  const [isLogin, setIsLogin] = useState(currentScreen === Screen.LOGIN);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    upiPin: '',
    confirmPin: ''
  });
  const [error, setError] = useState('');

  const handleSwitch = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '', upiPin: '', confirmPin: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API Network Call
    setTimeout(() => {
      if (isLogin) {
        if (formData.email && formData.password) {
          // Mock Login Success
          onLogin({
            name: 'Arjun Kumar',
            email: formData.email,
            password: formData.password, // Persist password for settings validation
            phoneNumber: '+91 98765 43210',
            upiId: 'arjun@novapay',
            balance: 15420.50,
            upiPin: '1234',
            preferences: DEFAULT_PREFERENCES
          });
        } else {
          setError('Please fill in all fields');
          setIsLoading(false);
        }
      } else {
        // Validation for Signup
        if (!formData.name || !formData.email || !formData.password || !formData.upiPin) {
          setError('All fields are required');
          setIsLoading(false);
          return;
        }
        if (formData.upiPin.length !== 4) {
          setError('UPI PIN must be 4 digits');
          setIsLoading(false);
          return;
        }
        if (formData.upiPin !== formData.confirmPin) {
          setError('PINs do not match');
          setIsLoading(false);
          return;
        }
        
        // Mock Signup Success
        onLogin({
          name: formData.name,
          email: formData.email,
          password: formData.password, // Persist password
          phoneNumber: '+91 98765 43210',
          upiId: `${formData.name.toLowerCase().replace(/\s/g, '')}@novapay`,
          balance: 1000.00,
          upiPin: formData.upiPin,
          preferences: DEFAULT_PREFERENCES
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-md md:max-w-5xl rounded-3xl shadow-xl md:shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side (Desktop Illustration) */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-indigo-600 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          
          <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8">
               <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                 <Wallet className="w-8 h-8 text-white" />
               </div>
               <span className="text-2xl font-bold tracking-tight">NovaPay</span>
             </div>
             
             <h2 className="text-4xl font-bold leading-tight mb-6">
               The Future of <br/> Digital Payments <br/> is Here.
             </h2>
             
             <div className="space-y-4">
               <div className="flex items-center gap-3 text-indigo-100">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                 <span>Instant UPI Transfers</span>
               </div>
               <div className="flex items-center gap-3 text-indigo-100">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                 <span>Secure Bank-grade Security</span>
               </div>
               <div className="flex items-center gap-3 text-indigo-100">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                 <span>Zero Commission Fees</span>
               </div>
             </div>
          </div>

          <div className="relative z-10 text-xs text-indigo-200 mt-auto">
            © 2024 NovaPay Payments Bank Ltd.
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="md:hidden flex items-center justify-center mb-8">
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Wallet className="text-white w-6 h-6" />
             </div>
          </div>

          <div className="mb-8 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Enter your details to access your wallet' : 'Join millions of users today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto md:mx-0 w-full">
            {!isLogin && (
              <Input 
                placeholder="Full Name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                disabled={isLoading}
              />
            )}
            
            <Input 
              type="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              disabled={isLoading}
            />
            
            <Input 
              type="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              disabled={isLoading}
            />

            {!isLogin && (
              <>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900">Set UPI PIN</h4>
                    <p className="text-xs text-indigo-700 mt-1">You will use this 4-digit PIN for all transactions.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    type="tel" 
                    maxLength={4}
                    placeholder="Set PIN" 
                    value={formData.upiPin}
                    onChange={e => setFormData({...formData, upiPin: e.target.value.replace(/\D/g, '')})}
                    className="text-center tracking-widest font-mono"
                    disabled={isLoading}
                  />
                  <Input 
                    type="tel" 
                    maxLength={4}
                    placeholder="Confirm" 
                    value={formData.confirmPin}
                    onChange={e => setFormData({...formData, confirmPin: e.target.value.replace(/\D/g, '')})}
                    className="text-center tracking-widest font-mono"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>}

            <Button fullWidth type="submit" className="mt-6 flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  {isLogin ? 'Login Securely' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center md:text-left">
            <button 
              type="button"
              onClick={handleSwitch}
              className="text-indigo-600 font-medium hover:underline text-sm"
              disabled={isLoading}
            >
              {isLogin ? "New to NovaPay? Create account" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};