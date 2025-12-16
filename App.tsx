import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ObjectiveView } from './components/ObjectiveView';
import { ConstraintsView } from './components/ConstraintsView';
import { TasksView } from './components/TasksView';
import { PlanningView } from './components/PlanningView';
import { Dashboard } from './components/Dashboard';
import { SharedView } from './components/SharedView';
import { LandingPage } from './components/LandingPage';
import { Toast } from './components/Toast';
import { Objective, Task, ScheduleSlot, TaskStatus } from './types';

// Add Silk type to the global window object to avoid TypeScript errors
declare global {
  interface Window {
    silk?: (command: string, ...args: any[]) => void;
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [step, setStep] = useState(1);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [isSharedView, setIsSharedView] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'error' }>({
    message: '',
    visible: false,
    type: 'success'
  });

  // SilkHQ Initialization
  useEffect(() => {
    if (window.silk) {
      // TODO: Replace with your actual SilkHQ API key
      window.silk('init', 'YOUR_SILK_API_KEY');
    }
  }, []);

  // Centralized analytics tracking function
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (window.silk) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      // Enrich all events with device context
      window.silk('event', { name: eventName, properties: { ...properties, device: isMobile ? 'mobile' : 'desktop' } });
    } else {
      // Fallback for local development if Silk is not available
      console.log(`[Analytics Disabled] Event: ${eventName}`, properties);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, visible: true, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Check for shared data or local data
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#shared=')) {
        const encodedData = hash.substring(8);
        const decodedJson = atob(encodedData);
        const sharedData = JSON.parse(decodedJson);
        if (sharedData.objectives && sharedData.tasks) {
          setObjectives(Array.isArray(sharedData.objectives) ? sharedData.objectives : []);
          setTasks(Array.isArray(sharedData.tasks) ? sharedData.tasks : []);
          setIsSharedView(true);
          setView('app'); // Go straight to app for shared links
          trackEvent('shared_plan_viewed');
        }
      } else if (hash === '#app') {
        // Deep link to app
        setView('app');
        loadLocalData();
      } else {
        loadLocalData();
      }
    } catch (e) {
      console.error("Failed to parse data, resetting.", e);
      localStorage.removeItem('frenchPlannerData_v2');
      window.location.hash = ''; // Clear corrupted hash
    }
  }, []);

  const loadLocalData = () => {
    try {
      const saved = localStorage.getItem('frenchPlannerData_v2');
      if (saved) {
        const data = JSON.parse(saved);
        
        if (Array.isArray(data.objectives)) {
          setObjectives(data.objectives);
        } else if (data.objective) { 
          // Legacy support
          setObjectives([{ ...data.objective, id: 'default', color: '#3b82f6' }]); 
        }
        
        if (Array.isArray(data.tasks)) {
          const validTasks = data.tasks.map((t: any) => ({
             ...t,
             objectiveId: t.objectiveId || (data.objective ? 'default' : ''),
             subtasks: Array.isArray(t.subtasks) ? t.subtasks : [], 
             scheduledSlots: Array.isArray(t.scheduledSlots) ? t.scheduledSlots : (t.scheduledSlotId ? [t.scheduledSlotId] : []),
             completedSlots: Array.isArray(t.completedSlots) ? t.completedSlots : (t.status === 'Fait' && t.scheduledSlotId ? [t.scheduledSlotId] : []),
             repeatCount: t.repeatCount || 1,
             isRecurring: t.isRecurring ?? true,
          })).filter((t: Task) => t.objectiveId);
          setTasks(validTasks);
        }
        
        if (Array.isArray(data.schedule)) {
          setSchedule(data.schedule);
        }
      }
    } catch (error) {
       console.error("Error loading local data", error);
       // Optional: Clear data if needed
    }
  };

  // Persist data to local storage only if it's not a shared view
  useEffect(() => {
    if (!isSharedView && view === 'app') {
      localStorage.setItem('frenchPlannerData_v2', JSON.stringify({ objectives, tasks, schedule }));
    }
  }, [objectives, tasks, schedule, isSharedView, view]);

  const handleStartApp = () => {
    setView('app');
    window.history.pushState(null, '', '#app');
    trackEvent('app_started');
  };

  const handleLogout = () => {
    setView('landing');
    window.history.pushState(null, '', '#');
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handleResetProgress = () => {
    if (window.confirm("Démarrer une nouvelle semaine ?\n\n- Les tâches récurrentes (routines) seront remises à 'À faire'.\n- Les tâches ponctuelles terminées seront retirées du planning.")) {
      trackEvent('progress_reset');
      setTasks(tasks.map(t => {
        if (t.isRecurring) {
          return { ...t, status: TaskStatus.PENDING, completedSlots: [], subtasks: t.subtasks.map(st => ({ ...st, isCompleted: false })) };
        } else {
           if (t.status === TaskStatus.COMPLETED || (t.scheduledSlots.length > 0 && t.completedSlots.length === t.scheduledSlots.length)) {
             return { ...t, scheduledSlots: [], status: TaskStatus.COMPLETED };
           }
           return t;
        }
      }));
      showToast('Semaine réinitialisée avec succès !');
    }
  };

  const handleClearAll = () => {
    if (window.confirm("⚠️ Attention : Cette action va effacer TOUTES vos données (objectifs, tâches, planning). Êtes-vous sûr de vouloir recommencer à zéro ?")) {
      trackEvent('data_cleared');
      setObjectives([]);
      setTasks([]);
      setSchedule([]);
      setStep(1);
      localStorage.removeItem('frenchPlannerData_v2');
      showToast('Données effacées.', 'error');
      setView('landing');
    }
  };
  
  if (view === 'landing') {
    return (
      <LandingPage 
        onStart={handleStartApp} 
        hasData={objectives.length > 0} 
      />
    );
  }

  if (isSharedView) {
    return <SharedView objectives={objectives} tasks={tasks} />;
  }

  return (
    <Layout step={step} setStep={setStep} trackEvent={trackEvent}>
      {/* Add a "Back to Home" temporary button for dev testing if needed, or rely on browser back */}
      {step === 1 && (
        <ObjectiveView objectives={objectives} setObjectives={setObjectives} onNext={handleNext} />
      )}
      {step === 2 && (
        <ConstraintsView schedule={schedule} setSchedule={setSchedule} onNext={handleNext} trackEvent={trackEvent} />
      )}
      {step === 3 && (
        <TasksView objectives={objectives} tasks={tasks} setTasks={setTasks} onNext={handleNext} trackEvent={trackEvent} />
      )}
      {step === 4 && (
        <PlanningView objectives={objectives} tasks={tasks} setTasks={setTasks} schedule={schedule} onNext={handleNext} trackEvent={trackEvent} />
      )}
      {step === 5 && (
        <Dashboard
          objectives={objectives}
          tasks={tasks}
          setTasks={setTasks}
          onResetProgress={handleResetProgress}
          onClearAll={handleClearAll}
          trackEvent={trackEvent}
          showToast={showToast}
        />
      )}
      <Toast message={toast.message} isVisible={toast.visible} onClose={hideToast} type={toast.type} />
    </Layout>
  );
};

export default App;