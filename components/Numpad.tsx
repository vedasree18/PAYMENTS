import React from 'react';
import { Delete } from 'lucide-react';

interface NumpadProps {
  onInput: (val: string) => void;
  onDelete: () => void;
  theme?: 'light' | 'dark';
  extraKey?: React.ReactNode;
  onExtraKey?: () => void;
}

export const Numpad: React.FC<NumpadProps> = ({ 
  onInput, 
  onDelete, 
  theme = 'light', 
  extraKey, 
  onExtraKey 
}) => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  
  const btnClass = `h-14 md:h-16 w-full flex items-center justify-center text-2xl md:text-3xl font-semibold rounded-2xl transition-all duration-150 active:scale-90 select-none cursor-pointer ${
    isDark 
      ? 'hover:bg-white/10 active:bg-white/20' 
      : 'hover:bg-gray-50 active:bg-gray-200'
  }`;

  return (
    <div className={`grid grid-cols-3 gap-x-4 md:gap-x-6 gap-y-3 px-6 md:px-8 pb-8 pt-4 ${textColor}`}>
      {nums.map((n) => (
        <button
          key={n}
          onClick={() => onInput(n.toString())}
          className={btnClass}
        >
          {n}
        </button>
      ))}
      
      <div className="flex items-center justify-center">
        {extraKey && (
          <button 
            onClick={onExtraKey}
            className={btnClass}
          >
            {extraKey}
          </button>
        )}
      </div>

      <button
        onClick={() => onInput('0')}
        className={btnClass}
      >
        0
      </button>

      <button
        onClick={onDelete}
        className={`${btnClass} group`}
      >
        <Delete className={`w-8 h-8 transition-colors ${isDark ? 'text-white/70' : 'text-gray-400 group-hover:text-gray-900'}`} />
      </button>
    </div>
  );
};