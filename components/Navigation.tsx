import React from 'react';
import { Screen, User } from '../types';
import { Home, History, User as UserIcon, QrCode, LogOut, Wallet, Bell, Settings } from 'lucide-react';

interface NavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  user?: User;
  onLogout?: () => void;
}

export const DesktopHeader: React.FC<NavProps> = ({ currentScreen, onNavigate, user, onLogout }) => {
  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', screen: Screen.DASHBOARD },
    // "Payments" removed to avoid redundancy. Actions are on Dashboard, History is below.
    { label: 'History', screen: Screen.HISTORY },
    { label: 'Profile', screen: Screen.PROFILE },
  ];

  return (
    <div className="hidden md:flex bg-white px-8 py-4 shadow-sm items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(Screen.DASHBOARD)}>
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">NovaPay</span>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen)}
              className={`transition-colors hover:text-indigo-600 ${
                currentScreen === item.screen ? 'text-indigo-600 font-bold' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="h-6 w-px bg-gray-200"></div>
        
        <div className="flex items-center gap-4">
           <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
             <Bell className="w-5 h-5" />
           </button>
           <button 
             className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
             onClick={() => onNavigate(Screen.PROFILE)}
           >
             <Settings className="w-5 h-5" />
           </button>
           
           <div 
             className="flex items-center gap-3 pl-2 cursor-pointer"
             onClick={() => onNavigate(Screen.PROFILE)}
           >
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                {user.name.charAt(0)}
              </div>
              <div>
                 <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                 <p className="text-xs text-gray-500 font-mono mt-1">{user.upiId}</p>
              </div>
           </div>
           
           {onLogout && (
             <button onClick={onLogout} className="ml-2 text-sm text-red-600 hover:text-red-700 font-medium">
               Logout
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export const MobileBottomNav: React.FC<NavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { label: 'Home', screen: Screen.DASHBOARD, icon: <Home className="w-6 h-6" /> },
    { label: 'Pay', screen: Screen.SCAN_QR, icon: <QrCode className="w-6 h-6" /> }, // Primary action
    { label: 'History', screen: Screen.HISTORY, icon: <History className="w-6 h-6" /> },
    { label: 'Profile', screen: Screen.PROFILE, icon: <UserIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center gap-1 min-w-[64px] ${
              isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-indigo-50 -translate-y-1' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};