/**
 * Loading Screen Component
 * Shows while app is initializing or loading data
 */

import React from 'react';
import { Wallet, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 animate-pulse">
            <Wallet className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NovaPay</h1>
        
        {/* Loading Indicator */}
        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">{message}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-indigo-600 rounded-full animate-loading-bar"></div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
