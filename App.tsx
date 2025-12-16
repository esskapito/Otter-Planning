import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ObjectiveView } from './components/ObjectiveView';
import { ConstraintsView } from './components/ConstraintsView';
import { TasksView } from './components/TasksView';
import { PlanningView } from './components/PlanningView';
import { Dashboard } from './components/Dashboard';
import { SharedView } from './components/SharedView';
import { LandingPage } from './components/LandingPage';
import { TemplateView } from './components/TemplateView';
import { Toast } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Objective, Task, ScheduleSlot, TaskStatus, Subtask, Category } from './types';
import { OBJECTIVE_COLORS } from './constants';

// Add Silk type to the global window object to avoid TypeScript errors
declare global {
  interface Window {
    silk?: (command: string, ...args: any[]) => void;
  }
}

const decodeFromHash = (encodedData: string): string | null => {
  try {
    // New, correct method for UTF-8 characters
    return decodeURIComponent(escape(atob(encodedData)));
  } catch (e) {
    console.warn("UTF-8 decoding failed, falling back to simple atob.", e);
    try {
      // Fallback for old links that might not be UTF-8 encoded
      return atob(encodedData);
    } catch (finalError) {
      console.error("Could not decode data from hash.", finalError);
      return null;
    }
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [step, setStep] = useState(1);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [isSharedView, setIsSharedView] = useState(false);
  const [templateToImport, setTemplateToImport] = useState<null | { objective: Objective; tasks: Task[] }>(null);
  
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

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Check for shared data or local data
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#template=')) {
        const encodedData = hash.substring(10);
        const decodedJson = decodeFromHash(encodedData);
        if(decodedJson) {
          const templateData = JSON.parse(decodedJson);
          if (templateData.objective && templateData.tasks) {
              // Rehydrate tasks with full properties
              const hydratedTasks = templateData.tasks.map((t: any) => ({
                id: '', objectiveId: '',
                title: t.title || 'Tâche sans titre',
                category: t.category || Category.AUTRE,
                durationMinutes: t.durationMinutes || 30,
                status: TaskStatus.PENDING,
                repeatCount: t.repeatCount || 1,
                isRecurring: t.isRecurring ?? true,
                scheduledSlots: [], completedSlots: [],
                subtasks: (t.subtasks || []).map((st: any) => ({ id: '', title: st.title, completedInSlots: [] }))
              }));
              setTemplateToImport({ objective: templateData.objective, tasks: hydratedTasks });
              setView('app'); // Go to app view, which will be intercepted to show TemplateView
              trackEvent('template_link_viewed');
          }
        }
      } else if (hash.startsWith('#shared=')) {
        const encodedData = hash.substring(8);
        const decodedJson = decodeFromHash(encodedData);
        if(decodedJson) {
          const sharedData = JSON.parse(decodedJson);
          if (sharedData.objectives && sharedData.tasks) {
            setObjectives(Array.isArray(sharedData.objectives) ? sharedData.objectives : []);
            setTasks(Array.isArray(sharedData.tasks) ? sharedData.tasks : []);
            setIsSharedView(true);
            setView('app'); // Go straight to app for shared links
            trackEvent('shared_plan_viewed');
          }
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
        setView('app'); // User has data, go to app
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
             subtasks: Array.isArray(t.subtasks) 
                ? t.subtasks.map((st: any) => ({
                    id: st.id,
                    title: st.title,
                    completedInSlots: Array.isArray(st.completedInSlots) ? st.completedInSlots : []
                  }))
                : [],
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
    if (!isSharedView && !templateToImport && view === 'app') {
      localStorage.setItem('frenchPlannerData_v2', JSON.stringify({ objectives, tasks, schedule }));
    }
  }, [objectives, tasks, schedule, isSharedView, templateToImport, view]);

  const handleStartApp = () => {
    setView('app');
    window.history.pushState(null, '', '#app');
    trackEvent('app_started');
  };
  
  const handleImportTemplate = () => {
    if (!templateToImport) return;
    trackEvent('template_imported');

    loadLocalData(); // Ensure we have the latest local data before merging

    const newObjectiveId = generateId();
    const newObjective: Objective = {
        ...templateToImport.objective,
        id: newObjectiveId,
        color: OBJECTIVE_COLORS[objectives.length % OBJECTIVE_COLORS.length]
    };

    const newTasks: Task[] = templateToImport.tasks.map(task => ({
        ...task,
        id: generateId(),
        objectiveId: newObjectiveId,
        subtasks: task.subtasks.map(st => ({...st, id: generateId()}))
    }));
    
    setObjectives(prev => [...prev, newObjective]);
    setTasks(prev => [...prev, ...newTasks]);
    
    setTemplateToImport(null);
    window.location.hash = '#app';
    setStep(3);
    showToast(`Objectif "${newObjective.title}" ajouté !`, 'success');
  };
  
  const handleCancelImport = () => {
    setTemplateToImport(null);
    window.location.hash = hasData() ? '#app' : '';
    if (!hasData()) {
      setView('landing');
    }
  }

  const hasData = () => objectives.length > 0 || tasks.length > 0;

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handleResetProgress = () => {
    if (window.confirm("Démarrer une nouvelle semaine ?\n\n- Les tâches récurrentes (routines) seront remises à 'À faire'.\n- Les tâches ponctuelles terminées seront retirées du planning.")) {
      trackEvent('progress_reset');
      setTasks(tasks.map(t => {
        if (t.isRecurring) {
          return { ...t, status: TaskStatus.PENDING, completedSlots: [], subtasks: t.subtasks.map(st => ({ ...st, completedInSlots: [] })) };
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
      window.location.hash = '';
    }
  };
  
  const renderApp = () => {
    if (view === 'landing') {
      return (
        <LandingPage 
          onStart={handleStartApp} 
          hasData={hasData()} 
        />
      );
    }

    if (templateToImport) {
      return (
          <TemplateView 
              objective={templateToImport.objective}
              tasks={templateToImport.tasks}
              onImport={handleImportTemplate}
              onCancel={handleCancelImport}
          />
      );
    }

    if (isSharedView) {
      return <SharedView objectives={objectives} tasks={tasks} />;
    }

    return (
      <Layout step={step} setStep={setStep} trackEvent={trackEvent}>
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

  return (
    <ErrorBoundary>
      {renderApp()}
    </ErrorBoundary>
  );
};

export default App;