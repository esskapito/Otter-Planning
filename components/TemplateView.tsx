import React from 'react';
import { Task, Objective } from '../types';
import { CATEGORY_EMOJIS } from '../constants';

interface Props {
  objective: Objective;
  tasks: Task[];
  onImport: () => void;
  onCancel: () => void;
}

export const TemplateView: React.FC<Props> = ({ objective, tasks, onImport, onCancel }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-xl font-bold">Vous avez reçu un template Otter !</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ajoutez cet objectif et ses tâches à votre planning.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
           <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white">{objective.title}</h3>
           <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 block">
             Objectif {objective.type === 'week' ? 'Hebdomadaire' : 'Mensuel'}
           </span>
           {objective.description && (
             <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{objective.description}</p>
           )}
        </div>

        <div>
           <h2 className="text-lg font-bold mb-4">Tâches incluses ({tasks.length})</h2>
           <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                   <div className="text-2xl">{CATEGORY_EMOJIS[task.category]}</div>
                   <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                         {task.category} &bull; {task.durationMinutes}min &bull; {task.repeatCount}x par semaine
                      </div>
                      {task.subtasks.length > 0 && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          (+{task.subtasks.length} {task.subtasks.length > 1 ? 'étapes' : 'étape'})
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>
      
      <footer className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto flex-1 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Ignorer
          </button>
          <button
            onClick={onImport}
            className="w-full sm:w-auto flex-1 py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-2xl shadow-indigo-300 dark:shadow-indigo-900/50"
          >
            🦦 Ajouter à mon Otter
          </button>
        </div>
      </footer>
    </div>
  );
};
