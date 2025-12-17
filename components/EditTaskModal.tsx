import React, { useState, useEffect } from 'react';
import { Task, Category } from '../types';

interface Props {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onClose: () => void;
}

export const EditTaskModal: React.FC<Props> = ({ task, onSave, onClose }) => {
  const [editedTask, setEditedTask] = useState(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to trim scheduled slots if repeat count is reduced
    if (editedTask.scheduledSlots.length > editedTask.repeatCount) {
        onSave({
            ...editedTask,
            scheduledSlots: editedTask.scheduledSlots.slice(0, editedTask.repeatCount)
        });
    } else {
        onSave(editedTask);
    }
  };

  const handleChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNumericChange = (field: 'durationMinutes' | 'repeatCount', value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      handleChange(field, numValue);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 animate-slide-up">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Modifier la tâche</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Titre</label>
            <input
              value={editedTask.title}
              onChange={e => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none sm:text-sm bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
              placeholder="Ex: Réviser le chapitre 3"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Catégorie</label>
              <select
                value={editedTask.category}
                onChange={e => handleChange('category', e.target.value as Category)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm text-slate-900 dark:bg-slate-900 dark:text-white"
              >
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Durée (min)</label>
              <input
                type="number"
                step="5"
                value={editedTask.durationMinutes}
                onChange={e => handleNumericChange('durationMinutes', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Répétitions / semaine</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleChange('repeatCount', Math.max(1, editedTask.repeatCount - 1))}
                className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold"
              >-</button>
              <span className="font-mono font-bold text-slate-900 dark:text-white w-6 text-center">{editedTask.repeatCount}</span>
              <button
                type="button"
                onClick={() => handleChange('repeatCount', Math.min(10, editedTask.repeatCount + 1))}
                className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold"
              >+</button>
              <span className="text-xs text-slate-500 ml-auto">fois / sem</span>
            </div>
             {editedTask.scheduledSlots.length > editedTask.repeatCount && (
                <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-2">
                    Attention: Des sessions planifiées seront retirées pour correspondre à ce nouveau total.
                </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={editedTask.isRecurring}
                  onChange={e => handleChange('isRecurring', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Répéter chaque semaine (Routine)
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!editedTask.title}
              className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
