import React from 'react';
import { OtterLogo } from './OtterLogo';

interface Props {
  onStart: () => void;
}

const steps = [
    { title: 'Objectifs', desc: 'Définis tes buts principaux.' },
    { title: 'Contraintes', desc: 'Bloque tes indisponibilités.' },
    { title: 'Tâches', desc: 'Liste les actions à réaliser.' },
    { title: 'Planning', desc: 'Organise ta semaine idéale.' },
];

export const OnboardingModal: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 text-center animate-slide-up">
        <OtterLogo className="w-20 h-20 mx-auto mb-4 drop-shadow-lg" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bienvenue sur Otter !</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Prépare-toi à organiser ta semaine de la manière la plus simple et efficace possible.</p>
        
        <div className="space-y-3 text-left mb-8">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                        {index + 1}
                    </div>
                    <div>
                        <h2 className="font-semibold text-slate-800 dark:text-slate-200">{step.title}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
                    </div>
                </div>
            ))}
        </div>

        <button 
          onClick={onStart}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 hover:scale-105"
        >
          C'est parti !
        </button>
      </div>
    </div>
  );
};
