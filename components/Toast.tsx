import React, { useEffect } from 'react';

interface Props {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'error';
}

export const Toast: React.FC<Props> = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[70] animate-in slide-in-from-top-5 fade-in duration-300 w-max max-w-[90vw]">
       <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-medium text-sm border border-slate-700 dark:border-slate-200">
         <span className={`flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {type === 'success' ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
         </span>
         <span className="truncate">{message}</span>
       </div>
    </div>
  );
};