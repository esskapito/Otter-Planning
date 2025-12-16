import React from 'react';
import { Task, Objective } from '../types';
import { DAYS_OF_WEEK } from '../constants';

interface Props {
  objectives: Objective[];
  tasks: Task[];
}

export const SharedView: React.FC<Props> = ({ objectives, tasks }) => {

  const tasksByDay = DAYS_OF_WEEK.map((day, dayIndex) => {
    const dailyItems = tasks.flatMap(task => 
      task.scheduledSlots
        .filter(slotId => slotId.startsWith(`${dayIndex}-`))
        .map(slotId => ({ task, slotId }))
    ).sort((a, b) => parseInt(a.slotId.split('-')[1]) - parseInt(b.slotId.split('-')[1]));
    return { day, items: dailyItems };
  });

  const handleCreateOwn = () => {
    window.location.hash = '';
    window.location.reload();
  };

  const renderTaskItem = ({ task: t, slotId }: { task: Task, slotId: string }) => {
    const taskObjective = objectives.find(o => o.id === t.objectiveId);
    const isSlotCompleted = t.completedSlots.includes(slotId);
    const hour = slotId.split('-')[1];

    return (
      <div key={slotId} className="group">
        <div className="flex items-start">
          <div className="w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mr-3 mt-1.5 bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
            {isSlotCompleted && <svg className="w-4 h-4 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{backgroundColor: taskObjective?.color || '#ccc'}}></div>
            <div className="p-3">
              <div className="min-w-0 pl-2">
                <div className={`font-medium text-sm truncate ${isSlotCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>{t.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                  <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded mr-2 text-[10px]">{hour}h00</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300 mr-2">{taskObjective?.title}</span>
                  {t.category} • {t.durationMinutes} min
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-xl font-bold">Un planning a été partagé avec vous !</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Voici un aperçu en lecture seule.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold mb-4">Objectifs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objectives.map(obj => {
              const objTasks = tasks.filter(t => t.objectiveId === obj.id);
              const objTotalSlots = objTasks.reduce((acc, t) => acc + t.scheduledSlots.length, 0);
              const objCompletedSlots = objTasks.reduce((acc, t) => acc + t.completedSlots.length, 0);
              const objProgress = objTotalSlots === 0 ? 0 : Math.round((objCompletedSlots / objTotalSlots) * 100);
              return (
                <div key={obj.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1.5 h-full" style={{backgroundColor: obj.color}}></div>
                   <h3 className="font-bold text-slate-900 dark:text-white mb-1 pl-2">{obj.title}</h3>
                   <div className="pl-2">
                     <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        <span>Progression</span>
                        <span>{objProgress}%</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{width: `${objProgress}%`, backgroundColor: obj.color}}></div>
                     </div>
                   </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
           <h2 className="text-lg font-bold mb-4">Agenda de la semaine</h2>
           <div className="space-y-6">
              {tasksByDay.map((d) => (
                d.items.length > 0 && (
                  <div key={d.day}>
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
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
      </main>

      <footer className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleCreateOwn}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-2xl shadow-indigo-300 dark:shadow-indigo-900/50"
          >
            ✨ Créer mon propre planning
          </button>
        </div>
      </footer>
    </div>
  );
};
