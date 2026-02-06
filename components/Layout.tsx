import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-[100dvh] w-full bg-gray-50 md:bg-gray-100 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 flex flex-col">
      {/* 
         Structure:
         - Root: min-h-[100dvh] ensures full viewport height on mobile (accounting for address bars).
         - Child: flex-1 ensures the content area grows to fill the screen, pushing footers down if needed.
      */}
      <main className={`flex-1 flex flex-col w-full relative ${className}`}>
        {children}
      </main>
    </div>
  );
};

export const DesktopWrapper: React.FC<{ children: React.ReactNode; bgClass?: string; maxWidth?: string }> = ({ children, bgClass = 'bg-white', maxWidth = 'md:max-w-[480px]' }) => (
  <div className={`flex-1 w-full flex items-center justify-center p-0 md:p-6 ${bgClass} md:bg-gray-900/50 md:backdrop-blur-sm`}>
    <div className={`w-full h-full md:h-auto md:min-h-[650px] ${maxWidth} md:rounded-[2.5rem] md:shadow-2xl overflow-hidden flex flex-col relative ${bgClass} transition-colors duration-500`}>
      {children}
    </div>
  </div>
);