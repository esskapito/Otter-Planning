import React, { useEffect, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Sidebar: React.FC<Props> = ({ isOpen, onClose, children }) => {
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
    <div className="fixed inset-0 z-[60] flex justify-start lg:hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div 
        className={`
          relative w-[85%] max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-r border-slate-200 dark:border-slate-800
          ${isVisible ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {children}
      </div>
    </div>
  );
};