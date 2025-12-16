import React, { useState } from 'react';
import { Task, ScheduleSlot, TaskStatus, Objective } from '../types';
import { DAYS_OF_WEEK, HOURS_OF_DAY, CATEGORY_COLORS } from '../constants';
import { BottomSheet } from './BottomSheet';

interface Props {
  objectives: Objective[];
  tasks: Task[];
  setTasks: (t: Task[]) => void;
  schedule: ScheduleSlot[];
  onNext: () => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
}

export const PlanningView: React.FC<Props> = ({ objectives, tasks, setTasks, schedule, onNext, trackEvent }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0); // 0 = Monday, for mobile view
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);

  const unscheduledTasks = tasks.filter(t => t.scheduledSlots.length < t.repeatCount);
  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const isBlocked = (day: number, hour: number) => 
    schedule.some(s => s.dayIndex === day && s.hour === hour && s.isBlocked);

  const getTaskInSlot = (day: number, hour: number) => {
    const slotId = `${day}-${hour}`;
    return tasks.find(t => t.scheduledSlots.includes(slotId));
  };
    
  const getObjectiveColor = (objId: string) => 
    objectives.find(o => o.id === objId)?.color || '#94a3b8';

  const handleTaskSelect = (taskId: string | null) => {
    const newSelectedId = selectedTaskId === taskId ? null : taskId;
    const task = tasks.find(t => t.id === newSelectedId);
    trackEvent('planning_task_select', { 
      selected: !!newSelectedId, 
      task_title: task?.title,
      source: 'sidebar'
    });
    setSelectedTaskId(newSelectedId);
  };
  
  const handleMobileDaySwitch = (dayIndex: number) => {
    trackEvent('mobile_planning_day_switch', { day: DAYS_OF_WEEK[dayIndex] });
    setActiveDay(dayIndex);
    setIsDaySheetOpen(false);
  };

  const handleBannerCancel = () => {
    trackEvent('planning_task_select', {
      selected: false,
      task_title: selectedTask?.title,
      source: 'mobile_banner_cancel'
    });
    setSelectedTaskId(null);
  };

  const handleSlotClick = (dayIndex: number, hour: number) => {
    const slotId = `${dayIndex}-${hour}`;
    const existingTask = getTaskInSlot(dayIndex, hour);

    if (existingTask) {
      trackEvent('planning_slot_cleared', { task_title: existingTask.title });
      setTasks(tasks.map(t => 
        t.id === existingTask.id 
          ? { ...t, scheduledSlots: t.scheduledSlots.filter(s => s !== slotId) } 
          : t
      ));
      return;
    }

    if (isBlocked(dayIndex, hour)) return;

    if (selectedTaskId && selectedTask) {
       if (selectedTask.scheduledSlots.length >= selectedTask.repeatCount) return; 

       trackEvent('planning_slot_filled', { task_title: selectedTask.title });
       const updatedTasks = tasks.map(t => 
         t.id === selectedTaskId 
           ? { ...t, scheduledSlots: [...t.scheduledSlots, slotId] } 
           : t
       );
       setTasks(updatedTasks);

       const newCount = selectedTask.scheduledSlots.length + 1;
       if (newCount >= selectedTask.repeatCount) {
         setSelectedTaskId(null);
       }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative">
      <div className={`
        mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors flex-shrink-0
        ${selectedTaskId ? 'hidden lg:flex' : 'flex'}
      `}>
        <div>
           <h2 className="text-lg font-bold text-slate-900 dark:text-white">Planification globale</h2>
           <p className="text-sm text-slate-500 dark:text-slate-400">Un créneau utilisé pour un objectif est bloqué pour les autres.</p>
        </div>
        <button onClick={onNext} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          Terminer & Voir les Stats
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-4 overflow-hidden relative">
        {/* Unscheduled Tasks Bar */}
        <div className={`
          lg:w-1/4 lg:min-w-[280px] flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 lg:h-full lg:max-h-none transition-all duration-300
          ${selectedTaskId ? 'hidden lg:flex' : 'flex max-h-[220px]'}
        `}>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-sm flex justify-between items-center">
            <span>À placer</span>
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-xs">{unscheduledTasks.length}</span>
          </div>
          <div className="flex-1 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto p-3 flex lg:flex-col gap-4 custom-scrollbar">
            
            {objectives.map(obj => {
               const objTasks = unscheduledTasks.filter(t => t.objectiveId === obj.id);
               if (objTasks.length === 0) return null;

               return (
                 <div key={obj.id} className="min-w-[200px] lg:min-w-0 flex-shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{color: obj.color}}>
                       <span className="w-2 h-2 rounded-full" style={{backgroundColor: obj.color}}></span>
                       {obj.title}
                    </h3>
                    <div className="space-y-2">
                       {objTasks.map(task => {
                         const remaining = task.repeatCount - task.scheduledSlots.length;
                         return (
                          <div
                            key={task.id}
                            onClick={() => handleTaskSelect(task.id)}
                            className={`
                              p-3 rounded-lg border cursor-pointer transition-all active:scale-95
                              ${selectedTaskId === task.id 
                                ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-400 dark:ring-indigo-400' 
                                : 'border-slate-200 bg-white hover:border-indigo-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-500'
                              }
                            `}
                          >
                             <div className="flex justify-between items-center mb-1">
                                <span 
                                  className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400"
                                >
                                  {task.category}
                                </span>
                                <div className="flex items-center gap-2">
                                  {task.isRecurring && (
                                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                  )}
                                  {task.repeatCount > 1 && (
                                     <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-1.5 rounded-full font-bold">
                                       {task.scheduledSlots.length}/{task.repeatCount}
                                     </span>
                                  )}
                                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{task.durationMinutes}m</span>
                                </div>
                             </div>
                             <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{task.title}</p>
                          </div>
                         );
                       })}
                    </div>
                 </div>
               )
            })}
            
            {unscheduledTasks.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm p-4 min-w-[200px] lg:min-w-0">
                 Tout est placé !
              </div>
            )}
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-auto relative transition-colors flex flex-col">
           
           {/* DESKTOP VIEW: Full 7-day grid */}
           <div className="hidden lg:block min-w-[800px] h-full flex flex-col">
              <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-20">
                <div className="p-2 bg-white dark:bg-slate-800"></div>
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className="p-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-800">
                    {d.slice(0, 3)}
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-8">
                  {HOURS_OF_DAY.map(h => (
                    <React.Fragment key={h}>
                      <div className="text-xs font-medium text-slate-400 dark:text-slate-500 text-center py-2 -mt-2.5 border-r border-slate-100 dark:border-slate-700 relative bg-white dark:bg-slate-800">
                        <span className="absolute top-0 w-full text-center left-0 bg-transparent z-10">{h}h</span>
                      </div>
                      {DAYS_OF_WEEK.map((_, dIndex) => {
                        const blocked = isBlocked(dIndex, h);
                        const task = getTaskInSlot(dIndex, h);
                        const isSelected = selectedTaskId !== null;

                        return (
                          <div
                            key={`${dIndex}-${h}`}
                            onClick={() => handleSlotClick(dIndex, h)}
                            className={`
                              h-16 border-b border-r border-slate-100 dark:border-slate-700 relative group transition-colors
                              ${blocked 
                                ? 'bg-slate-50 dark:bg-slate-900 cursor-not-allowed pattern-diagonal-lines' 
                                : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700'
                              }
                            `}
                          >
                            {task && (
                              <div 
                                className="absolute inset-1 rounded bg-opacity-90 p-1.5 text-white shadow-sm overflow-hidden flex flex-col justify-center border border-white/20"
                                style={{ backgroundColor: CATEGORY_COLORS[task.category] }}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="font-semibold text-xs truncate flex-1">{task.title}</div>
                                  {task.isRecurring && (
                                     <svg className="w-2.5 h-2.5 text-white/80 flex-shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                   <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                   <span className="text-[9px] opacity-90 truncate">{objectives.find(o => o.id === task.objectiveId)?.title}</span>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 absolute top-0 right-0 p-0.5 bg-black/20 rounded-bl text-[10px]">✕</div>
                              </div>
                            )}
                            {!task && !blocked && isSelected && (
                              <div className="absolute inset-1 border-2 border-dashed border-indigo-300 dark:border-indigo-500 rounded bg-indigo-50/50 dark:bg-indigo-900/30 flex items-center justify-center opacity-50">
                                <span className="text-indigo-600 dark:text-indigo-400 text-lg">+</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
           </div>

           {/* MOBILE VIEW: Single day grid with time column */}
           <div className="lg:hidden flex flex-col h-full">
              {/* Sticky Day Selector with Bottom Sheet Trigger */}
              <div className="flex-shrink-0 sticky top-0 z-30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-2">
                <button 
                   onClick={() => setIsDaySheetOpen(true)}
                   className="w-full flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold text-sm"
                >
                   <span className="flex items-center gap-2">
                     <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                     {DAYS_OF_WEEK[activeDay]}
                   </span>
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              <BottomSheet isOpen={isDaySheetOpen} onClose={() => setIsDaySheetOpen(false)} title="Changer de jour">
                <div className="grid grid-cols-1 gap-2">
                  {DAYS_OF_WEEK.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => handleMobileDaySwitch(index)}
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

              <div className="p-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-[3.5rem_1fr] gap-3 pb-20"> {/* pb-20 for floating banner space */}
                   {/* Rows */}
                   {HOURS_OF_DAY.map((hour) => {
                     const blocked = isBlocked(activeDay, hour);
                     const task = getTaskInSlot(activeDay, hour);
                     const isSelected = selectedTaskId !== null;
                     
                     return (
                       <React.Fragment key={hour}>
                          <div className="flex items-center justify-center text-xs text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 rounded-lg h-16">
                            {hour}:00
                          </div>
                          <div
                            onClick={() => handleSlotClick(activeDay, hour)}
                            className={`
                              h-16 rounded-lg transition-all border relative
                              ${blocked 
                                ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 cursor-not-allowed pattern-diagonal-lines' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm active:scale-[0.99]'
                              }
                            `}
                          >
                            {task && (
                               <div 
                                 className="absolute inset-1 rounded bg-opacity-90 p-2 text-white shadow-sm overflow-hidden flex flex-col justify-center border border-white/20"
                                 style={{ backgroundColor: CATEGORY_COLORS[task.category] }}
                               >
                                 <div className="flex justify-between items-start">
                                    <div className="font-bold text-sm truncate">{task.title}</div>
                                    {task.isRecurring && (
                                       <svg className="w-3 h-3 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    )}
                                 </div>
                                 <div className="text-[10px] opacity-90 truncate flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                    {objectives.find(o => o.id === task.objectiveId)?.title}
                                 </div>
                               </div>
                             )}
                             {!task && !blocked && isSelected && (
                                <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-dashed border-indigo-300 dark:border-indigo-500 rounded-lg flex items-center justify-center animate-pulse">
                                  <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">Placer ici</span>
                                </div>
                             )}
                             {!task && !blocked && !isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs">
                                  Libre
                                </div>
                             )}
                          </div>
                       </React.Fragment>
                     );
                   })}
                </div>
              </div>
           </div>

        </div>
      </div>
      
      {/* Floating Bottom Banner for Mobile Task Selection */}
      {selectedTaskId && selectedTask && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 fade-in">
           <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl shadow-indigo-900/20 border border-slate-700/50 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: CATEGORY_COLORS[selectedTask.category]}}></div>
              <div className="min-w-0 flex-1 mr-4 pl-2">
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded text-indigo-100">{selectedTask.category}</span>
                   <span className="text-xs opacity-70">{selectedTask.durationMinutes} min</span>
                 </div>
                 <p className="font-bold text-sm truncate">{selectedTask.title}</p>
                 <div className="text-[10px] mt-0.5 opacity-60">
                   {selectedTask.repeatCount - selectedTask.scheduledSlots.length} fois restantes
                 </div>
              </div>
              <button 
                onClick={handleBannerCancel}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors"
              >
                Annuler
              </button>
           </div>
        </div>
      )}

       <style>{`
        .pattern-diagonal-lines {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, #f1f5f9 5px, #f1f5f9 6px);
        }
        .dark .pattern-diagonal-lines {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, #0f172a 5px, #0f172a 6px);
        }
      `}</style>
    </div>
  );
};