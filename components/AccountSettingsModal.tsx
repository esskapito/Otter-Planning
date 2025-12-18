import React from 'react';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const AccountSettingsModal: React.FC<Props> = ({ isOpen, onClose, currentUser }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Mon Profil</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-xl mb-4 transform rotate-3" 
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h3>
            <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-4">
             <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-300 flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             </div>
             <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">Synchronisation Active</p>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">Ton planning est sauvegardé sur le Cloud Rabbit. Tu peux le retrouver sur ton téléphone en te connectant.</p>
             </div>
          </div>

          <div className="space-y-3">
             <button 
                onClick={onClose}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 transition-colors"
             >
                Fermer
             </button>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Éducation Française • Cloud Rabbit v4.0</p>
        </div>
      </div>
    </div>
  );
};