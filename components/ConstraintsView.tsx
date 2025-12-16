import React, { useState } from 'react';
import { ScheduleSlot } from '../types';
import { DAYS_OF_WEEK, HOURS_OF_DAY } from '../constants';
import { BottomSheet } from './BottomSheet';

interface Props {
  schedule: ScheduleSlot[];
  setSchedule: (slots: ScheduleSlot[]) => void;
  onNext: () => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
}

export const ConstraintsView: React.FC<Props> = ({ schedule, setSchedule, onNext, trackEvent }) => {
  const [activeDay, setActiveDay] = useState(0); // 0 = Monday, for mobile view
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);

  const toggleSlot = (dayIndex: number, hour: number) => {
    const existingSlot = schedule.find(s => s.dayIndex === dayIndex && s.hour === hour);
    
    if (existingSlot) {
      const updated = schedule.map(s => 
        (s.dayIndex === dayIndex && s.hour === hour) 
          ? { ...s, isBlocked: !s.isBlocked } 
          : s
      );
      setSchedule(updated);
    } else {
      const newSlot: ScheduleSlot = {
        id: `${dayIndex}-${hour}`,
        dayIndex,
        hour,
        isBlocked: true
      };
      setSchedule([...schedule, newSlot]);
    }
  };

  const handleDaySwitch = (dayIndex: number) => {
    trackEvent('mobile_constraints_day_switch', { day: DAYS_OF_WEEK[dayIndex] });
    setActiveDay(dayIndex);
    setIsDaySheetOpen(false);
  };

  const isBlocked = (d: number, h: number) => {
    return schedule.find(s => s.dayIndex === d && s.hour === h)?.isBlocked;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Définir vos contraintes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Marquez les créneaux <strong className="text-rose-600 dark:text-rose-400">indisponibles</strong>.</p>
        </div>
        <button
          onClick={onNext}
          className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Valider
        </button>
      </div>

      {/* Mobile Day Selector Trigger */}
      <div className="md:hidden mb-4">
        <button 
          onClick={() => setIsDaySheetOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-900 dark:text-white font-medium"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {DAYS_OF_WEEK[activeDay]}
          </span>
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      </div>

      <BottomSheet isOpen={isDaySheetOpen} onClose={() => setIsDaySheetOpen(false)} title="Choisir le jour">
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

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 transition-colors">
        
        {/* DESKTOP VIEW: Full Grid */}
        <div className="hidden md:block overflow-x-auto p-4">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-xs font-semibold text-slate-400 uppercase text-center py-2 self-end">Heure</div>
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase text-center py-2 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                  {day.substring(0, 3)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-8 gap-2">
              {HOURS_OF_DAY.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="text-xs text-slate-400 font-medium text-center py-3 flex items-center justify-center">
                    {hour}h
                  </div>
                  {DAYS_OF_WEEK.map((_, dayIndex) => {
                    const blocked = isBlocked(dayIndex, hour);
                    return (
                      <button
                        key={`${dayIndex}-${hour}`}
                        onClick={() => toggleSlot(dayIndex, hour)}
                        className={`
                          h-10 rounded-md transition-all border text-[10px] font-medium tracking-wide
                          ${blocked 
                            ? 'bg-rose-50 border-rose-200 text-rose-600 pattern-diagonal-lines dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' 
                            : 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-slate-600'
                          }
                        `}
                      >
                        {blocked ? 'OCCUPÉ' : ''}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* MOBILE VIEW: Single Day Grid */}
        <div className="md:hidden p-4">
          <div className="grid grid-cols-[3.5rem_1fr] gap-3">
             {/* Header */}
             <div className="text-xs font-bold text-slate-400 uppercase text-center self-center">Heure</div>
             <div className="text-sm font-bold text-slate-800 dark:text-white uppercase text-center py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
               {DAYS_OF_WEEK[activeDay]}
             </div>

             {/* Rows */}
             {HOURS_OF_DAY.map((hour) => {
               const blocked = isBlocked(activeDay, hour);
               return (
                 <React.Fragment key={hour}>
                    <div className="flex items-center justify-center text-xs text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 rounded-lg h-12">
                      {hour}:00
                    </div>
                    <button
                      onClick={() => toggleSlot(activeDay, hour)}
                      className={`
                        h-12 rounded-lg transition-all border text-xs font-bold tracking-wide shadow-sm
                        ${blocked 
                          ? 'bg-rose-50 border-rose-200 text-rose-600 pattern-diagonal-lines dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' 
                          : 'bg-white border-slate-200 hover:border-indigo-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                        }
                      `}
                    >
                      {blocked ? 'OCCUPÉ' : 'Disponible'}
                    </button>
                 </React.Fragment>
               );
             })}
          </div>
        </div>

      </div>
      <style>{`
        .pattern-diagonal-lines {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(225, 29, 72, 0.05) 5px, rgba(225, 29, 72, 0.05) 10px);
        }
      `}</style>
    </div>
  );
};