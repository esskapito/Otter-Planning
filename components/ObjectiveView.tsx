import React, { useState } from 'react';
import { Objective } from '../types';
import { OBJECTIVE_COLORS } from '../constants';

interface Props {
  objectives: Objective[];
  setObjectives: (objs: Objective[]) => void;
  onNext: () => void;
}

export const ObjectiveView: React.FC<Props> = ({ objectives, setObjectives, onNext }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'week' | 'month'>('week');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(objectives.length === 0);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    const newObjective: Objective = {
      id: generateId(),
      title,
      type,
      description,
      color: OBJECTIVE_COLORS[objectives.length % OBJECTIVE_COLORS.length]
    };

    setObjectives([...objectives, newObjective]);
    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  const removeObjective = (id: string) => {
    setObjectives(objectives.filter(o => o.id !== id));
    if (objectives.length === 1) setIsAdding(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vos Objectifs</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Définissez un ou plusieurs objectifs pour cette période (ex: Stage + Exam de Maths).</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Column */}
        <div>
          {isAdding || objectives.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Nouvel Objectif</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre</label>
                  <input
                    type="text"
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                    placeholder="Ex: Trouver un stage..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setType('week')}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      type === 'week' 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    Semaine
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('month')}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      type === 'month' 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'
                    }`}
                  >
                    Mois
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optionnel)</label>
                  <textarea
                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border h-20 resize-none bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                    placeholder="Détails..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                   {objectives.length > 0 && (
                     <button 
                       type="button" 
                       onClick={() => setIsAdding(false)}
                       className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                     >
                       Annuler
                     </button>
                   )}
                   <button
                    type="submit"
                    disabled={!title}
                    className="flex-1 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">+</span>
              <span className="font-medium">Ajouter un autre objectif</span>
            </button>
          )}
        </div>

        {/* List Column */}
        <div className="space-y-4">
          {objectives.map((obj) => (
             <div key={obj.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative group transition-all hover:shadow-md">
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" 
                  style={{ backgroundColor: obj.color }}
                ></div>
                <div className="pl-3">
                  <div className="flex justify-between items-start">
                     <div>
                       <h3 className="font-bold text-lg text-slate-900 dark:text-white">{obj.title}</h3>
                       <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                         {obj.type === 'week' ? 'Hebdomadaire' : 'Mensuel'}
                       </span>
                     </div>
                     <button 
                       onClick={() => removeObjective(obj.id)}
                       className="text-slate-300 hover:text-rose-500 p-1 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                       title="Supprimer"
                     >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                  </div>
                  {obj.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">{obj.description}</p>
                  )}
                </div>
             </div>
          ))}
          {objectives.length === 0 && !isAdding && (
            <div className="text-center text-slate-400 dark:text-slate-500 py-10">
              Aucun objectif défini.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
        <button
          onClick={onNext}
          disabled={objectives.length === 0}
          className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          Continuer vers Disponibilités &rarr;
        </button>
      </div>
    </div>
  );
};