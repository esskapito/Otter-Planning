import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { RabbitLogo } from './RabbitLogo';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  step: number;
  setStep: (step: number) => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  activeApp: 'plan' | 'note';
  setActiveApp: (app: 'plan' | 'note') => void;
  onOpenNoteManager: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  isSyncing: boolean;
}

const steps = [
  { id: 1, label: 'Objectif' },
  { id: 2, label: 'Disponibilités' },
  { id: 3, label: 'Tâches' },
  { id: 4, label: 'Planning' },
  { id: 5, label: 'Tableau de bord' }
];

export const Layout: React.FC<LayoutProps> = ({ 
  children, step, setStep, trackEvent, activeApp, setActiveApp, onOpenNoteManager, 
  currentUser, onOpenAuth, onLogout, onOpenSettings, isSyncing
}) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleThemeToggle = () => {
    trackEvent('theme_toggled', { theme: !darkMode ? 'dark' : 'light' });
    setDarkMode(!darkMode);
  };
  
  const handleMenuToggle = () => {
    trackEvent('mobile_menu_toggle', { open: !isMenuOpen });
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAppSwitch = (app: 'plan' | 'note') => {
    trackEvent('app_switched', { app });
    setActiveApp(app);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <RabbitLogo className="w-10 h-10 drop-shadow-sm hover:scale-105 transition-transform cursor-pointer" />
                  {isSyncing && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-sm"></div>
                  )}
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
                  Rabbit
                </h1>
              </div>
              
              <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full items-center">
                <button onClick={() => handleAppSwitch('plan')} className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${activeApp === 'plan' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}>Plan</button>
                <button onClick={() => handleAppSwitch('note')} className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${activeApp === 'note' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}>Note</button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>

              <div className="relative">
                {currentUser ? (
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden md:block">{currentUser.name}</span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: currentUser.avatarColor }}>{currentUser.name.charAt(0).toUpperCase()}</div>
                  </button>
                ) : (
                  <button onClick={onOpenAuth} className="hidden md:block px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full hover:bg-indigo-700 transition-colors">Se connecter</button>
                )}

                {isUserMenuOpen && currentUser && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                       <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700 mb-1 text-center">
                          <div className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cloud Sync On</span>
                       </div>
                       <button onClick={() => { onOpenSettings(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Mon Profil</button>
                       <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">Déconnexion</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
         <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <RabbitLogo className="w-8 h-8" />
                    <span className="font-bold text-lg text-slate-900 dark:text-white">Rabbit</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
                {!currentUser ? (
                  <button onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Connexion Cloud</button>
                ) : (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                     <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Cloud Actif</span>
                     {isSyncing && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
                  </div>
                )}
                {activeApp === 'plan' && steps.map((s) => (
                    <button key={s.id} onClick={() => { setStep(s.id); setIsMenuOpen(false); }} className={`flex items-center w-full px-4 py-3 text-base font-medium rounded-xl ${step === s.id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}>
                      <span className={`w-2 h-2 rounded-full mr-4 ${step === s.id ? 'bg-indigo-600' : 'bg-slate-300'}`}></span>
                      {s.label}
                    </button>
                ))}
            </div>
         </div>
      </Sidebar>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};