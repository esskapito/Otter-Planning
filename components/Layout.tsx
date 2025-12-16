import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { OtterLogo } from './OtterLogo';

interface LayoutProps {
  children: React.ReactNode;
  step: number;
  setStep: (step: number) => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
}

const steps = [
  { id: 1, label: 'Objectif' },
  { id: 2, label: 'Disponibilités' },
  { id: 3, label: 'Tâches' },
  { id: 4, label: 'Planning' },
  { id: 5, label: 'Tableau de bord' }
];

export const Layout: React.FC<LayoutProps> = ({ children, step, setStep, trackEvent }) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  
  const handleThemeToggle = () => {
    trackEvent('theme_toggled', { theme: !darkMode ? 'dark' : 'light' });
    setDarkMode(!darkMode);
  };
  
  const handleMenuToggle = () => {
    trackEvent('mobile_menu_toggle', { open: !isMenuOpen });
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <OtterLogo className="w-10 h-10 drop-shadow-sm hover:scale-105 transition-transform cursor-pointer" />
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Otter</h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
               {/* Desktop Nav */}
              <nav className="hidden md:flex space-x-1">
                {steps.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      step === s.id
                        ? 'bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>

              {/* Theme Toggle */}
              <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={handleMenuToggle}
                className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
         <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <OtterLogo className="w-8 h-8" />
                    <span className="font-bold text-lg text-slate-900 dark:text-white">Otter</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                {steps.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                          setStep(s.id);
                          setIsMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-4 py-3.5 text-base font-medium rounded-xl transition-all ${
                          step === s.id 
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full mr-4 ${step === s.id ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                      {s.label}
                    </button>
                ))}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    OT
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Otter App</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Version 1.2</div>
                  </div>
               </div>
            </div>
         </div>
      </Sidebar>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};