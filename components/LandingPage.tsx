import React, { useEffect, useState } from 'react';
import { RabbitLogo } from './RabbitLogo';

interface Props {
  onStart: () => void;
  hasData: boolean;
}

export const LandingPage: React.FC<Props> = ({ onStart, hasData }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const steps = [
    {
      id: 1, 
      title: 'Objectifs', 
      desc: 'Définis clairement ce que tu veux accomplir cette semaine (Examens, Stages, Projets).',
      color: 'blue'
    },
    {
      id: 2, 
      title: 'Contraintes', 
      desc: 'Bloque tes horaires de cours, de sommeil et de repas. On ne planifie rien là-dessus.',
      color: 'rose'
    },
    {
      id: 3, 
      title: 'Tâches', 
      desc: 'Crée tes tâches et organise-les par catégorie pour une meilleure visibilité.',
      color: 'amber'
    },
    {
      id: 4, 
      title: 'Planning', 
      desc: 'Glisse tes tâches dans les créneaux libres. Visualise ta semaine et passe à l\'action.',
      color: 'emerald'
    },
  ];

  const getColorClass = (color: string) => {
    switch(color) {
        case 'blue': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
        case 'rose': return 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400';
        case 'amber': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
        case 'emerald': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
        default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Navbar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <RabbitLogo className="w-10 h-10 drop-shadow-md hover:scale-105 transition-transform" />
            <span className="font-bold text-xl text-slate-900 dark:text-white font-sans tracking-tight">Rabbit</span>
          </div>
          <button onClick={toggleTheme} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            {darkMode ? (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight animate-slide-up" style={{animationDelay: '0.1s'}}>
              Ton planning <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">vraiment</span> intelligent.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg animate-slide-up" style={{animationDelay: '0.2s'}}>
              Rabbit est l'outil ultime pour organiser ta vie scolaire et tes projets persos. Fixe tes objectifs, bloque tes créneaux, et plonge dans la productivité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <button onClick={onStart} className="px-8 py-4 bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 hover:scale-105 transition-all text-center">
                {hasData ? 'Continuer avec Rabbit' : 'Commencer gratuitement'}
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-center">
                Comment ça marche ?
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold">JD</div>
                <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold">AL</div>
                <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold">MK</div>
              </div>
              <p>Rejoins des étudiants organisés 🐇</p>
            </div>
          </div>
          
          <div className="relative lg:h-[500px] flex items-center justify-center animate-float hidden lg:flex">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            
            {/* Abstract Dashboard UI */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                {/* Header Mockup */}
                <div className="flex justify-between items-center mb-6">
                    <div className="space-y-2">
                         <div className="w-32 h-4 bg-slate-100 dark:bg-slate-700 rounded"></div>
                         <div className="w-20 h-2 bg-slate-50 dark:bg-slate-700/50 rounded"></div>
                    </div>
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-500">
                        {/* Rabbit Logo Small */}
                        <RabbitLogo className="w-8 h-8" />
                    </div>
                </div>
                
                {/* Task Cards Mockup */}
                <div className="space-y-3">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-indigo-400 flex justify-between items-center shadow-sm transform translate-x-4">
                        <div className="space-y-2">
                            <div className="w-24 h-3 bg-slate-200 dark:bg-slate-600 rounded"></div>
                            <div className="w-40 h-2 bg-slate-100 dark:bg-slate-700 rounded"></div>
                        </div>
                        <div className="w-6 h-6 rounded-full border-2 border-indigo-400 flex items-center justify-center"></div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-lg">
                        <div className="space-y-2">
                            <div className="w-32 h-3 bg-slate-700 dark:bg-slate-200 rounded"></div>
                            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-400 text-white flex items-center justify-center text-xs">✓</div>
                    </div>
                     <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-amber-400 flex justify-between items-center opacity-60 transform -translate-x-2">
                        <div className="space-y-2">
                            <div className="w-28 h-3 bg-slate-200 dark:bg-slate-600 rounded"></div>
                            <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Bottom Stats Mockup */}
                <div className="pt-6 flex gap-4">
                      <div className="flex-1 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center flex-col border border-indigo-100 dark:border-indigo-800/30">
                        <span className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">85%</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wide mt-1">Succès</span>
                      </div>
                      <div className="flex-1 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-col border border-purple-100 dark:border-purple-800/30">
                        <span className="text-2xl font-bold text-purple-500 dark:text-purple-400">12h</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wide mt-1">Focus</span>
                      </div>
                </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Une méthode simple en 4 étapes</h2>
            <p className="text-slate-600 dark:text-slate-400">Pas de configuration compliquée. Juste de l'action.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
             {steps.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all hover:-translate-y-1">
                  <div className={`w-12 h-12 ${getColorClass(item.color)} rounded-lg flex items-center justify-center mb-4 text-xl font-bold`}>{item.id}</div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">© 2024 Rabbit App.</p>
          <div className="flex justify-center gap-6 text-sm text-slate-400">
             <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Confidentialité</a>
             <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Conditions</a>
             <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};