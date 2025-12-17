import React, { useState, useMemo } from 'react';
import { Task, Objective } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  objectives: Objective[];
  onLinkTask: (taskId: string) => void;
  currentlyLinkedIds: string[];
}

export const LinkTaskModal: React.FC<Props> = ({ isOpen, onClose, tasks, objectives, onLinkTask, currentlyLinkedIds }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasksByObjective = useMemo(() => {
    return objectives.map(obj => ({
      ...obj,
      tasks: tasks.filter(task =>
        task.objectiveId === obj.id &&
        !currentlyLinkedIds.includes(task.id) &&
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(obj => obj.tasks.length > 0);
  }, [tasks, objectives, searchTerm, currentlyLinkedIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col h-[70vh] animate-slide-up">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lier la note à une tâche</h2>
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mt-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-900 dark:bg-slate-800 dark:text-white"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredTasksByObjective.length === 0 ? (
            <div className="text-center text-slate-400 dark:text-slate-500 py-10">
              Aucune tâche disponible à lier.
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredTasksByObjective.map(obj => (
                <li key={obj.id}>
                  <h3 className="font-bold text-sm mb-2" style={{ color: obj.color }}>{obj.title}</h3>
                  <div className="space-y-2">
                    {obj.tasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => onLinkTask(task.id)}
                        className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <p className="font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{task.category} • {task.durationMinutes}min</p>
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};