import React, { useState, useEffect } from 'react';
import { Task, Category, TaskStatus, Objective, Subtask } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { EditTaskModal } from './EditTaskModal';

interface Props {
  objectives: Objective[];
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  onNext: () => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const TasksView: React.FC<Props> = ({ objectives, tasks, setTasks, onNext, trackEvent, showToast }) => {
  const [activeObjectiveId, setActiveObjectiveId] = useState<string>(objectives[0]?.id || '');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false); // Mobile collapsible form
  
  const [newTask, setNewTask] = useState<{ title: string; category: Category; duration: number; repeatCount: number; isRecurring: boolean }>({
    title: '',
    category: Category.ETUDE,
    duration: 30,
    repeatCount: 1,
    isRecurring: true // Default to true as it's a planner
  });

  const activeObjective = objectives.find(o => o.id === activeObjectiveId);
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Auto-select first if available
  useEffect(() => {
    if (!activeObjectiveId && objectives.length > 0) {
      setActiveObjectiveId(objectives[0].id);
    }
  }, [objectives]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !activeObjectiveId) return;
    const task: Task = {
      id: generateId(),
      objectiveId: activeObjectiveId,
      title: newTask.title,
      category: newTask.category,
      durationMinutes: newTask.duration,
      repeatCount: newTask.repeatCount,
      isRecurring: newTask.isRecurring,
      status: TaskStatus.PENDING,
      scheduledSlots: [],
      completedSlots: [],
      subtasks: []
    };
    trackEvent('task_added_manually', { category: task.category, duration: task.durationMinutes, isRecurring: task.isRecurring });
    setTasks([...tasks, task]);
    setNewTask({ ...newTask, title: '' }); // Keep other settings
    setIsFormOpen(false); // Close form on mobile
  };
  
  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    trackEvent('task_edit_opened', { task_title: task.title });
    setTaskToEdit(task);
  };

  const handleSaveTask = (updatedTask: Task) => {
    trackEvent('task_edited', { task_title: updatedTask.title });
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setTaskToEdit(null);
    showToast('Tâche modifiée avec succès!', 'success');
  };


  const handleFormToggle = () => {
    trackEvent('mobile_task_form_toggle', { open: !isFormOpen });
    setIsFormOpen(!isFormOpen);
  };

  const removeTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addSubtask = (taskId: string) => {
    if (!newSubtaskTitle.trim()) return;
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [
            ...t.subtasks,
            { id: generateId(), title: newSubtaskTitle, completedInSlots: [] }
          ]
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.filter(st => st.id !== subtaskId)
        };
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const currentTasks = tasks.filter(t => t.objectiveId === activeObjectiveId);

  return (
    <div className="flex flex-col h-full">
      {/* Objective Tabs */}
      <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex space-x-2">
          {objectives.map(obj => (
            <button
              key={obj.id}
              onClick={() => setActiveObjectiveId(obj.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                ${activeObjectiveId === obj.id
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105 dark:bg-indigo-600 dark:border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
                }
              `}
              style={activeObjectiveId === obj.id ? { backgroundColor: obj.color, borderColor: obj.color } : {}}
            >
              {obj.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Creation Panel - Collapsible on Mobile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mobile Toggle Button */}
          <button 
             onClick={handleFormToggle}
             className="lg:hidden w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white"
          >
             <span>{isFormOpen ? 'Masquer le formulaire' : 'Ajouter une nouvelle tâche'}</span>
             <svg className={`w-5 h-5 transform transition-transform ${isFormOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
             </svg>
          </button>

          <div className={`
             bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all
             ${isFormOpen ? 'block' : 'hidden lg:block'}
          `}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 truncate">
              {activeObjective ? `Tâches pour : ${activeObjective.title}` : 'Sélectionnez un objectif'}
            </h2>
            
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Titre</label>
                <input
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none sm:text-sm bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                  placeholder="Ex: Réviser le chapitre 3"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Catégorie</label>
                  <select
                    value={newTask.category}
                    onChange={e => setNewTask({...newTask, category: e.target.value as Category})}
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
                    value={newTask.duration}
                    onChange={e => setNewTask({...newTask, duration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none sm:text-sm bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                  />
                 </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Répétitions / semaine</label>
                <div className="flex items-center gap-3">
                   <button 
                     type="button" 
                     onClick={() => setNewTask(p => ({...p, repeatCount: Math.max(1, p.repeatCount - 1)}))}
                     className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold"
                   >-</button>
                   <span className="font-mono font-bold text-slate-900 dark:text-white w-6 text-center">{newTask.repeatCount}</span>
                   <button 
                     type="button" 
                     onClick={() => setNewTask(p => ({...p, repeatCount: Math.min(10, p.repeatCount + 1)}))}
                     className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold"
                   >+</button>
                   <span className="text-xs text-slate-500 ml-auto">fois / sem</span>
                </div>
              </div>

              <div>
                 <label className="flex items-center gap-2 cursor-pointer group">
                   <div className="relative">
                     <input 
                       type="checkbox" 
                       checked={newTask.isRecurring}
                       onChange={e => setNewTask({...newTask, isRecurring: e.target.checked})}
                       className="sr-only peer"
                     />
                     <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                   </div>
                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                     Répéter chaque semaine (Routine)
                   </span>
                 </label>
                 <p className="text-[10px] text-slate-500 mt-1 ml-12">
                   Si activé, la tâche reviendra "À faire" chaque semaine. Sinon, elle disparaîtra une fois finie.
                 </p>
              </div>

              <button
                type="submit"
                disabled={!newTask.title || !activeObjectiveId}
                className="w-full py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
              >
                Ajouter la tâche
              </button>
            </form>
          </div>
        </div>

        {/* List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white">
               Liste des tâches 
               <span className="text-slate-400 dark:text-slate-500 font-normal ml-2 text-sm">
                 ({currentTasks.length} pour cet objectif)
               </span>
             </h2>
             <button onClick={onNext} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
               Passer au planning &rarr;
             </button>
          </div>
          
          {currentTasks.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500">
              <p className="text-sm">Aucune tâche pour cet objectif.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-24 lg:pb-0"> {/* Padding bottom for mobile scrolling */}
              {currentTasks.map(task => {
                const isExpanded = expandedTaskId === task.id;
                const isFullyScheduled = task.scheduledSlots.length >= task.repeatCount;
                
                return (
                  <div 
                    key={task.id} 
                    className={`
                      group bg-white dark:bg-slate-800 rounded-lg shadow-sm border transition-all relative overflow-hidden
                      ${isExpanded ? 'ring-2 ring-indigo-500 border-indigo-500 sm:col-span-2 z-10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 cursor-pointer'}
                    `}
                    onClick={() => !isExpanded && setExpandedTaskId(task.id)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[task.category] }}
                          ></span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {task.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleEditTask(task, e)}
                            className="text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 p-2 -mr-2 -mt-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                          </button>
                          <button
                            onClick={(e) => removeTask(task.id, e)}
                            className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-2 -mr-2 -mt-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-slate-900 dark:text-white leading-snug mb-1">{task.title}</h3>
                      
                      <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 gap-3">
                        <span>{task.durationMinutes} min</span>
                        {task.repeatCount > 1 && <span>{task.repeatCount}x / sem</span>}
                        {task.isRecurring && <span>Routine</span>}
                      </div>

                      {!isExpanded && (
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <div className="flex items-center text-slate-400 dark:text-slate-500">
                             <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                             {task.subtasks.length} étapes
                          </div>
                          {isFullyScheduled ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Planifié ✓</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-500 font-medium">
                              {task.scheduledSlots.length}/{task.repeatCount} planifiés
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-700 mt-2 bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="flex justify-between items-center py-2">
                           <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Étapes</h4>
                           <button onClick={(e) => { e.stopPropagation(); setExpandedTaskId(null); }} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium p-2">
                             Fermer
                           </button>
                        </div>
                        <ul className="space-y-2 mb-3">
                          {task.subtasks.map((st) => (
                            <li key={st.id} className="flex items-center justify-between text-sm group/st">
                               <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                  <span className="text-slate-700 dark:text-slate-300">{st.title}</span>
                               </div>
                               <button 
                                 onClick={() => removeSubtask(task.id, st.id)}
                                 className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 opacity-0 group-hover/st:opacity-100 transition-opacity p-1"
                               >
                                 ×
                               </button>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2">
                           <input
                             type="text"
                             value={newSubtaskTitle}
                             onChange={(e) => setNewSubtaskTitle(e.target.value)}
                             placeholder="Nouvelle étape..."
                             className="flex-1 px-2 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-indigo-500 outline-none bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                             onKeyDown={(e) => {
                               if(e.key === 'Enter') {
                                 e.preventDefault();
                                 addSubtask(task.id);
                               }
                             }}
                           />
                           <button 
                             onClick={() => addSubtask(task.id)}
                             disabled={!newSubtaskTitle.trim()}
                             className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
                           >
                             Ajouter
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
           
           {/* Global summary */}
           <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total: {tasks.length} tâches (tous objectifs confondus)</span>
              <button
                onClick={onNext}
                disabled={tasks.length === 0}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Organiser le Planning
              </button>
          </div>
        </div>
      </div>
      {taskToEdit && (
        <EditTaskModal
            task={taskToEdit}
            onSave={handleSaveTask}
            onClose={() => setTaskToEdit(null)}
        />
      )}
    </div>
  );
};
