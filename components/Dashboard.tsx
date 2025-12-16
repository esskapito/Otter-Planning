import React, { useState } from 'react';
import { Task, TaskStatus, Category, Objective, Subtask } from '../types';
import { CATEGORY_COLORS, CATEGORY_EMOJIS, DAYS_OF_WEEK } from '../constants';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BottomSheet } from './BottomSheet';
import { ShareSheet } from './ShareSheet';

interface Props {
  objectives: Objective[];
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  onResetProgress: () => void;
  onClearAll: () => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const getTodayIndex = () => {
  const day = new Date().getDay(); // Sunday = 0, Monday = 1...
  return day === 0 ? 6 : day - 1; // Adjust to our Monday = 0 index
};

export const Dashboard: React.FC<Props> = ({ objectives, tasks, setTasks, onResetProgress, onClearAll, trackEvent, showToast }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(getTodayIndex());
  const [mobileTab, setMobileTab] = useState<'agenda' | 'stats'>('agenda');
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
  const [objectiveToShare, setObjectiveToShare] = useState<null | { objective: Objective, tasks: Task[] }>(null);

  const handleShareObjective = (objectiveId: string) => {
    trackEvent('share_objective_clicked');
    const objective = objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    const associatedTasks = tasks.filter(t => t.objectiveId === objectiveId);
    setObjectiveToShare({ objective, tasks: associatedTasks });
  };

  // Stats calculation
  const totalSlots = tasks.reduce((acc, t) => acc + (t.scheduledSlots?.length || 0), 0);
  const completedSlotsCount = tasks.reduce((acc, t) => acc + (t.completedSlots?.length || 0), 0);
  const progress = totalSlots === 0 ? 0 : Math.round((completedSlotsCount / totalSlots) * 100);
  const totalHours = tasks.reduce((acc, t) => acc + (t.durationMinutes * (t.completedSlots?.length || 0)), 0) / 60;

  const toggleSlotCompletion = (taskId: string, slotId: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Check if we are checking (completing) the slot, not unchecking
    if (task && !task.completedSlots.includes(slotId)) {
        const willBeCompletedSlotsCount = task.completedSlots.length + 1;
        const totalTaskSlots = task.scheduledSlots.length;

        if (willBeCompletedSlotsCount >= totalTaskSlots && totalTaskSlots > 0) {
            showToast(`Tâche "${task.title}" terminée ! 🎉`, 'success');
        } else {
            showToast('Session validée ! Continue comme ça 🔥', 'success');
        }
    }

    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const isCompleted = t.completedSlots.includes(slotId);
      let newCompletedSlots = isCompleted ? t.completedSlots.filter(s => s !== slotId) : [...t.completedSlots, slotId];
      const allDone = t.scheduledSlots.every(s => newCompletedSlots.includes(s));
      const status = allDone ? TaskStatus.COMPLETED : TaskStatus.PENDING;
      return { ...t, completedSlots: newCompletedSlots, status };
    }));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const updatedSubtasks = t.subtasks.map(st => 
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
      );
      return { ...t, subtasks: updatedSubtasks };
    }));
  };

  const categoryData = Object.values(Category).map(cat => ({
    name: cat,
    value: tasks.filter(t => t.category === cat).reduce((acc, t) => acc + (t.durationMinutes * (t.scheduledSlots?.length || 0)), 0)
  })).filter(d => d.value > 0);

  const tasksByDay = DAYS_OF_WEEK.map((day, dayIndex) => {
    const dailyItems = tasks.flatMap(task => 
      (task.scheduledSlots || [])
        .filter(slotId => slotId.startsWith(`${dayIndex}-`))
        .map(slotId => ({ task, slotId }))
    ).sort((a, b) => parseInt(a.slotId.split('-')[1]) - parseInt(b.slotId.split('-')[1]));
    return { day, items: dailyItems };
  });

  const handleDaySwitch = (dayIndex: number) => {
    trackEvent('mobile_dashboard_day_switch', { day: DAYS_OF_WEEK[dayIndex] });
    setActiveDay(dayIndex);
    setIsDaySheetOpen(false);
  };
  
  const renderTaskItem = ({ task: t, slotId }: { task: Task, slotId: string }) => {
    const taskObjective = objectives.find(o => o.id === t.objectiveId);
    const isExpanded = expandedTaskId === t.id;
    const isSlotCompleted = t.completedSlots?.includes(slotId);
    const hour = slotId.split('-')[1];

    return (
      <div key={slotId} className="group">
        <div className="flex items-start">
          <button 
            onClick={() => toggleSlotCompletion(t.id, slotId)}
            className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all flex-shrink-0 mr-3 mt-3.5 ${isSlotCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300 hover:border-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:hover:border-indigo-400'}`}
          >
            {isSlotCompleted && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </button>
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{backgroundColor: taskObjective?.color || '#ccc'}}></div>
            <div 
              className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex justify-between items-center"
              onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
            >
              <div className="min-w-0 pl-2">
                <div className={`font-medium text-sm truncate ${isSlotCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>{t.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                  <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded mr-2 text-[10px]">{hour}h00</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300 mr-2">{taskObjective?.title}</span>
                  {t.category} • {t.durationMinutes} min
                </div>
              </div>
              {t.subtasks.length > 0 && (
                <svg className={`w-4 h-4 text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              )}
            </div>
            {isExpanded && t.subtasks.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 pl-6">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Étapes (Global)</div>
                <ul className="space-y-2">
                  {t.subtasks.map(st => (
                    <li key={st.id} className="flex items-center text-sm">
                      <button
                        onClick={() => toggleSubtask(t.id, st.id)}
                        className={`w-5 h-5 rounded-md border mr-2 flex items-center justify-center transition-colors ${st.isCompleted ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 hover:border-indigo-400 dark:border-slate-600 dark:hover:border-indigo-500'}`}
                      >
                        {st.isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </button>
                      <span className={`${st.isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>{st.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-xl p-6 sm:p-8 shadow-lg transition-colors">
          <h2 className="text-2xl font-bold mb-6">Tableau de bord Global</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-center"><div className="text-3xl sm:text-4xl font-bold">{progress}%</div><div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Avancement</div></div>
             <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-center"><div className="text-3xl sm:text-4xl font-bold">{totalHours.toFixed(1)}h</div><div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Travail Effectué</div></div>
             <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 flex flex-col justify-center"><div className="text-3xl sm:text-4xl font-bold">{totalSlots}</div><div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Sessions</div></div>
          </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {objectives.map(obj => {
          const objTasks = tasks.filter(t => t.objectiveId === obj.id);
          const objTotalSlots = objTasks.reduce((acc, t) => acc + (t.scheduledSlots?.length || 0), 0);
          const objCompletedSlots = objTasks.reduce((acc, t) => acc + (t.completedSlots?.length || 0), 0);
          const objProgress = objTotalSlots === 0 ? 0 : Math.round((objCompletedSlots / objTotalSlots) * 100);
          return (
            <div key={obj.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-colors group">
               <div className="absolute top-0 left-0 w-1.5 h-full" style={{backgroundColor: obj.color}}></div>
               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={() => handleShareObjective(obj.id)} 
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
                    title="Partager comme template"
                 >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                 </button>
               </div>
               <h3 className="font-bold text-slate-900 dark:text-white mb-1 pl-2 pr-8">{obj.title}</h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 pl-2">{objTotalSlots} sessions prévues</p>
               <div className="pl-2">
                 <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1"><span>Progression</span><span>{objProgress}%</span></div>
                 <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{width: `${objProgress}%`, backgroundColor: obj.color}}></div></div>
               </div>
            </div>
          )
        })}
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner mb-6 flex">
        <button 
          onClick={() => { setMobileTab('agenda'); trackEvent('dashboard_tab_change', { tab: 'agenda' }); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mobileTab === 'agenda' ? 'bg-white text-indigo-600 dark:bg-slate-700 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          Agenda
        </button>
        <button 
           onClick={() => { setMobileTab('stats'); trackEvent('dashboard_tab_change', { tab: 'stats' }); }}
           className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mobileTab === 'stats' ? 'bg-white text-indigo-600 dark:bg-slate-700 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          Statistiques
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 space-y-6 ${mobileTab === 'stats' ? 'hidden md:block' : ''}`}>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Agenda de la semaine</h3>
             
             {/* Mobile Day Selector Trigger */}
             <div className="md:hidden mb-4">
                <button 
                  onClick={() => setIsDaySheetOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-900 dark:text-white font-medium"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {DAYS_OF_WEEK[activeDay]}
                  </span>
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
             </div>

             <BottomSheet isOpen={isDaySheetOpen} onClose={() => setIsDaySheetOpen(false)} title="Changer de jour">
                <div className="grid grid-cols-1 gap-2">
                  {DAYS_OF_WEEK.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => handleDaySwitch(index)}
                      className={`
                        w-full px-4 py-3 rounded-xl text-left font-medium transition-all flex items-center justify-between
                        ${activeDay === index
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
                          : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                        }
                      `}
                    >
                      <span>{day}</span>
                      {activeDay === index && <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                  ))}
                </div>
              </BottomSheet>
             
             {/* Mobile View - Single Day */}
             <div className="md:hidden space-y-3">
                {tasksByDay[activeDay].items.length > 0 ? (
                  tasksByDay[activeDay].items.map(renderTaskItem)
                ) : (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                    <p>Rien de prévu pour {DAYS_OF_WEEK[activeDay]}.</p>
                    <p className="mt-1">Profitez-en pour vous reposer ! ☀️</p>
                  </div>
                )}
             </div>

             {/* Desktop View - Full Week */}
             <div className="hidden md:block space-y-6">
                {tasksByDay.map((d) => (
                  d.items.length > 0 && (
                    <div key={d.day}>
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                        {d.day}
                      </h4>
                      <div className="space-y-3">
                        {d.items.map(renderTaskItem)}
                      </div>
                    </div>
                  )
                ))}
             </div>
          </div>
        </div>
        
        <div className={`space-y-6 ${mobileTab === 'agenda' ? 'hidden md:block' : ''}`}>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Temps planifié par Type</h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value" 
                    cornerRadius={4}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: '#1e293b', color: '#fff'}} itemStyle={{fontWeight: 600, color: '#e2e8f0', fontSize: '12px'}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {categoryData.map(d => (
                <div key={d.name} className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center">
                     <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: CATEGORY_COLORS[d.name as Category]}}></div>
                     <span className="font-medium text-slate-600 dark:text-slate-300">{d.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{d.value}m</span>
                </div>
              ))}
              {categoryData.length === 0 && (
                 <div className="text-center text-xs text-slate-400 py-2">Aucune tâche planifiée</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Gestion des données</h3>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-between transition-colors">
            <div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-1"><strong>Sauvegarde automatique :</strong> Vos données sont enregistrées sur cet appareil.</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Utilisez ces options pour gérer votre planning.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
               <button onClick={onResetProgress} className="px-4 py-3 sm:py-2 border border-amber-300 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50 text-sm font-medium transition-colors">Réinitialiser</button>
               <button onClick={onClearAll} className="px-4 py-3 sm:py-2 border border-rose-300 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/50 text-sm font-medium transition-colors">Tout effacer</button>
            </div>
         </div>
      </div>
      <ShareSheet 
        data={objectiveToShare} 
        onClose={() => setObjectiveToShare(null)}
        showToast={showToast}
      />
    </div>
  );
};