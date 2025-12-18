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
  { id: 2, label: 'Dispos' },
  { id: 3, label: 'Tâches' },
  { id: 4, label: 'Planning' },
  { id: 5, label: 'Dashboard' }
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
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAppSwitch = (app: 'plan' | 'note') => {
    trackEvent('app_switched', { app });
    setActiveApp(app);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Universal Menu Trigger */}
              <button 
                onClick={handleMenuToggle}
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-2 group"
                aria-label="Ouvrir le menu"
              >
                <div className="flex flex-col gap-1 w-5">
                   <span className={`h-0.5 w-full bg-slate-500 dark:bg-slate-400 rounded-full transition-all group-hover:bg-indigo-500`}></span>
                   <span className={`h-0.5 w-4 bg-slate-500 dark:bg-slate-400 rounded-full transition-all group-hover:bg-indigo-500 group-hover:w-full`}></span>
                   <span className={`h-0.5 w-full bg-slate-500 dark:bg-slate-400 rounded-full transition-all group-hover:bg-indigo-500`}></span>
                </div>
                <span className="hidden lg:block text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500">Menu</span>
              </button>

              <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => { if(isMenuOpen) setIsMenuOpen(false); else setStep(1); }}>
                <div className="relative">
                  <RabbitLogo className="w-10 h-10 drop-shadow-sm group-hover:scale-110 transition-transform" />
                  {isSyncing && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse shadow-sm"></div>
                  )}
                </div>
                <h1 className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white hidden xs:block">
                  Rabbit
                </h1>
              </div>
              
              <div className="hidden sm:flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full items-center ml-4">
                <button onClick={() => handleAppSwitch('plan')} className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all ${activeApp === 'plan' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}>Planning</button>
                <button onClick={() => handleAppSwitch('note')} className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all ${activeApp === 'note' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}>Notes</button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                aria-label="Changer de thème"
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
                  <button onClick={onOpenAuth} className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">Connexion</button>
                )}

                {isUserMenuOpen && currentUser && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-3 z-20 animate-in fade-in slide-in-from-top-2">
                       <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700 mb-2 text-center">
                          <div className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronisation v4.4</span>
                       </div>
                       <button onClick={() => { onOpenSettings(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Mon Profil</button>
                       <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors border-t border-slate-50 dark:border-slate-700 mt-1">Déconnexion</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Navigation for Desktop Steps */}
        {activeApp === 'plan' && (
          <div className="hidden md:block bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide">
             <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-center space-x-12">
                {steps.map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => setStep(s.id)}
                    className={`flex items-center gap-2 group transition-all relative ${step === s.id ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-100'}`}
                  >
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${step === s.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-200'}`}>
                      {s.id}
                    </span>
                    <span className={`text-xs font-black uppercase tracking-widest ${step === s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {s.label}
                    </span>
                    {step === s.id && (
                      <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-in fade-in slide-in-from-bottom-1"></span>
                    )}
                  </button>
                ))}
             </div>
          </div>
        )}
      </header>

      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
         <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center space-x-3">
                    <RabbitLogo className="w-8 h-8" />
                    <span className="font-black text-xl text-slate-900 dark:text-white tracking-tighter">Rabbit Menu</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                {!currentUser ? (
                  <button onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">Connexion Cloud</button>
                ) : (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-[0.2em]">Cloud Actif</span>
                     </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Applications</div>
                  <button onClick={() => { handleAppSwitch('plan'); setIsMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 ${activeApp === 'plan' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="text-xl">📋</span>
                    <span>Planning</span>
                  </button>
                  <button onClick={() => { handleAppSwitch('note'); setIsMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 ${activeApp === 'note' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className="text-xl">✍️</span>
                    <span>Notes</span>
                  </button>
                </div>

                {activeApp === 'plan' && (
                  <div className="space-y-1">
                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4">Étapes du plan</div>
                    {steps.map((s) => (
                      <button key={s.id} onClick={() => { setStep(s.id); setIsMenuOpen(false); }} className={`flex items-center w-full px-4 py-3 text-sm font-bold rounded-2xl transition-all ${step === s.id ? 'bg-slate-100 text-indigo-700 dark:bg-slate-800 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] mr-3 transition-all ${step === s.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-700'}`}>
                          {s.id}
                        </span>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
               <button onClick={handleThemeToggle} className="w-full flex items-center justify-between px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md active:scale-95">
                  <span>{darkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
                  <div className="p-1 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    {darkMode ? <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" /></svg> : <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>}
                  </div>
               </button>
               {currentUser && (
                 <button onClick={onLogout} className="w-full py-4 text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl">
                    Déconnexion
                 </button>
               )}
            </div>
         </div>
      </Sidebar>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
};