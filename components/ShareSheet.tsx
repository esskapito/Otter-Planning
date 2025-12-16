import React, { useEffect, useState } from 'react';
import { Objective, Task } from '../types';

interface Props {
  data: { objective: Objective; tasks: Task[] } | null;
  onClose: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const ShareSheet: React.FC<Props> = ({ data, onClose, showToast }) => {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (data) {
      const { objective, tasks } = data;
      // Prune data to create a smaller, cleaner URL
      const tasksForSharing = tasks.map(({ title, category, durationMinutes, repeatCount, isRecurring, subtasks }) => ({
        title, category, durationMinutes, repeatCount, isRecurring, subtasks: subtasks.map(st => ({ title: st.title }))
      }));
      const objectiveForSharing = { title: objective.title, type: objective.type, description: objective.description };

      const dataToShare = { objective: objectiveForSharing, tasks: tasksForSharing };
      const jsonString = JSON.stringify(dataToShare);
      
      // Correctly handle UTF-8 strings before encoding to prevent errors with special characters.
      const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
      
      const url = `${window.location.origin}${window.location.pathname}#template=${encodedData}`;
      setShareUrl(url);
    }
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Lien du template copié !', 'success');
      onClose();
    }).catch(err => {
      console.error('Failed to copy link: ', err);
      showToast('Échec de la copie', 'error');
    });
  };
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Template Otter: ${data?.objective.title}`,
          text: `Découvre ce template d'objectif sur Otter, l'app de planning intelligent !`,
          url: shareUrl,
        });
        onClose();
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      showToast('Partage natif non supporté sur ce navigateur.', 'error');
    }
  };

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />
      
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-xl shadow-2xl transition-transform duration-300 ease-out flex flex-col animate-slide-up"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
           <h3 className="font-bold text-lg text-slate-900 dark:text-white">Partager l'objectif</h3>
           <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
                Partagez l'objectif <strong className="text-slate-800 dark:text-slate-100">{data.objective.title}</strong> et ses tâches comme un modèle réutilisable.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Lien de partage</label>
              <input 
                type="text"
                readOnly
                value={shareUrl}
                className="mt-1 block w-full text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleCopy} className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Copier le lien
              </button>
              {navigator.share && (
                <button onClick={handleNativeShare} className="flex-1 px-4 py-3 bg-slate-100 text-slate-800 font-medium rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors text-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                  Partager...
                </button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};