import React, { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<Props> = ({ isOpen, onClose, title, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow render before animating in
      const timer = setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      document.body.style.overflow = '';
      // Wait for animation to finish before unmounting
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={`
          relative w-full bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out max-h-[85vh] flex flex-col
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
           <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        {title && (
          <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
             <button 
               onClick={onClose} 
               className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto overscroll-contain custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};