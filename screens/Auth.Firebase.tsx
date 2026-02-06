import React, { useState } from 'react';
import { User, Screen } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Wallet, ShieldCheck, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, getUserDocument } from '../firebase';

interface AuthProps {
  onLogin: (user: User) => void;
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}

export const AuthFirebase: React.FC<AuthProps> = ({ onLogin, onNavigate, currentScreen }) => {
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

  const convertFirestoreUserToAppUser = (firestoreUser: any, uid: string): User => {
    return {
      name: firestoreUser.name,
      email: firestoreUser.email,
      password: '', // Don't expose password
      phoneNumber: firestoreUser.phoneNumber || '+91 98765 43210',
      upiId: firestoreUser.upiId,
      balance: firestoreUser.balance,
      upiPin: firestoreUser.upiPin,
      preferences: firestoreUser.preferences
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login with Firebase
        if (!formData.email || !formData.password) {
          setError('Please fill in all fields');
          setIsLoading(false);
          return;
        }

        const { uid } = await signInWithEmail(formData.email, formData.password);
        const firestoreUser = await getUserDocument(uid);
        
        if (firestoreUser) {
          const appUser = convertFirestoreUserToAppUser(firestoreUser, uid);
          onLogin(appUser);
        }
      } else {
        // Signup with Firebase
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

        const { uid } = await signUpWithEmail(
          formData.email,
          formData.password,
          formData.name,
          formData.upiPin
        );

        const firestoreUser = await getUserDocument(uid);
        if (firestoreUser) {
          const appUser = convertFirestoreUserToAppUser(firestoreUser, uid);
          onLogin(appUser);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      const { uid, isNewUser } = await signInWithGoogle();
      
      // If new user, they need to set UPI PIN
      if (isNewUser) {
        setError('Please set your UPI PIN');
        // In production, redirect to PIN setup screen
        setIsLoading(false);
        return;
      }

      const firestoreUser = await getUserDocument(uid);
      if (firestoreUser) {
        const appUser = convertFirestoreUserToAppUser(firestoreUser, uid);
        onLogin(appUser);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      setIsLoading(false);
    }
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

          {/* Google Sign In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-700">Google</span>
            </button>
          </div>

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
