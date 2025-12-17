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
import { OnboardingModal } from './components/OnboardingModal';
import { NoteView } from './components/NoteView';
import { NoteManagementModal } from './components/NoteManagementModal';
import { Objective, Task, ScheduleSlot, TaskStatus, Subtask, Category, Note, NoteCategory } from './types';
import { OBJECTIVE_COLORS, DEFAULT_NOTE_CATEGORIES } from './constants';

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
  const [activeApp, setActiveApp] = useState<'plan' | 'note'>('plan');
  const [step, setStep] = useState(1);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteCategories, setNoteCategories] = useState<NoteCategory[]>(DEFAULT_NOTE_CATEGORIES);
  const [isSharedView, setIsSharedView] = useState(false);
  const [templateToImport, setTemplateToImport] = useState<null | { objective: Objective; tasks: Task[] }>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [noteToView, setNoteToView] = useState<string | null>(null);
  const [isNoteManagerOpen, setIsNoteManagerOpen] = useState(false);

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

  const loadLocalData = () => {
    try {
      const saved = localStorage.getItem('frenchPlannerData_v3');
      if (saved) {
        setView('app');
        const data = JSON.parse(saved);

        const planData = data.plan || {};
        
        if (Array.isArray(planData.objectives)) setObjectives(planData.objectives);
        if (Array.isArray(planData.schedule)) setSchedule(planData.schedule);

        if (Array.isArray(planData.tasks)) {
           const validTasks = planData.tasks.map((t: any) => ({
             ...t,
             objectiveId: t.objectiveId,
             subtasks: Array.isArray(t.subtasks) 
                ? t.subtasks.map((st: any) => ({
                    id: st.id, title: st.title, completedInSlots: Array.isArray(st.completedInSlots) ? st.completedInSlots : []
                  }))
                : [],
             scheduledSlots: Array.isArray(t.scheduledSlots) ? t.scheduledSlots : [],
             completedSlots: Array.isArray(t.completedSlots) ? t.completedSlots : [],
             repeatCount: t.repeatCount || 1,
             isRecurring: t.isRecurring ?? true,
          })).filter((t: Task) => t.objectiveId);
          setTasks(validTasks);
        }
        
        const loadedCategories = Array.isArray(data.noteCategories) ? data.noteCategories : DEFAULT_NOTE_CATEGORIES;
        setNoteCategories(loadedCategories);
        
        if (Array.isArray(data.notes)) {
          // --- MIGRATION LOGIC ---
          // Migrates notes from old enum-based category to new dynamic categoryId
          const migratedNotes = data.notes.map((n: any) => {
            if (n.category && typeof n.category === 'string' && !n.categoryId) {
              const categoryName = n.category as string;
              let foundCategory = loadedCategories.find((c: NoteCategory) => c.name.toLowerCase() === categoryName.toLowerCase());
              if (!foundCategory) {
                 foundCategory = loadedCategories.find((c: NoteCategory) => c.id === 'autre') || loadedCategories[0];
              }
              const { category, ...rest } = n;
              return {
                ...rest,
                categoryId: foundCategory.id,
                tags: Array.isArray(n.tags) ? n.tags : [],
              };
            }
            return {
              ...n,
              tags: Array.isArray(n.tags) ? n.tags : [],
              categoryId: n.categoryId || 'autre'
            };
          });
          setNotes(migratedNotes);
        }
      }
    } catch (error) {
       console.error("Error loading local data", error);
    }
  };

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
              setView('app');
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
            setView('app');
            trackEvent('shared_plan_viewed');
          }
        }
      } else if (hash === '#app') {
        setView('app');
        loadLocalData();
      } else if (!localStorage.getItem('frenchPlannerData_v3')) {
        setShowOnboarding(true);
        setView('app');
      } else {
        loadLocalData();
      }
    } catch (e) {
      console.error("Failed to parse data, resetting.", e);
      localStorage.removeItem('frenchPlannerData_v3');
      window.location.hash = '';
    }
  }, []);

  // Persist data to local storage
  useEffect(() => {
    if (!isSharedView && !templateToImport && view === 'app') {
      const dataToSave = {
        plan: { objectives, tasks, schedule },
        notes,
        noteCategories,
      };
      localStorage.setItem('frenchPlannerData_v3', JSON.stringify(dataToSave));
    }
  }, [objectives, tasks, schedule, notes, noteCategories, isSharedView, templateToImport, view]);

  const handleStartApp = () => {
    setView('app');
    window.history.pushState(null, '', '#app');
    trackEvent('app_started');
  };
  
  const handleImportTemplate = () => {
    if (!templateToImport) return;
    trackEvent('template_imported');

    loadLocalData();

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

  const hasData = () => objectives.length > 0 || tasks.length > 0 || notes.length > 0;

  const handleNext = () => {
    if (step === 1 && showOnboarding) {
      setShowOnboarding(false);
      trackEvent('onboarding_skipped');
    }
    setStep(prev => Math.min(prev + 1, 5));
  };
  
  const handleNavigateToNote = (noteId: string) => {
    setActiveApp('note');
    setNoteToView(noteId);
    trackEvent('navigated_to_note_from_plan');
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
    if (window.confirm("⚠️ Attention : Cette action va effacer TOUTES vos données (objectifs, tâches, planning, notes). Êtes-vous sûr de vouloir recommencer à zéro ?")) {
      trackEvent('data_cleared');
      setObjectives([]);
      setTasks([]);
      setSchedule([]);
      setNotes([]);
      setNoteCategories(DEFAULT_NOTE_CATEGORIES);
      setStep(1);
      setActiveApp('plan');
      localStorage.removeItem('frenchPlannerData_v3');
      showToast('Données effacées.', 'error');
      setView('landing');
      window.location.hash = '';
    }
  };
  
  const handleOnboardingStart = () => {
    setShowOnboarding(false);
    trackEvent('onboarding_completed');
    localStorage.setItem('onboarding_complete', 'true');
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
    
    if (showOnboarding) {
      return (
        <>
          <Layout step={step} setStep={setStep} trackEvent={trackEvent} activeApp={activeApp} setActiveApp={setActiveApp} onOpenNoteManager={() => setIsNoteManagerOpen(true)}><div/></Layout>
          <OnboardingModal onStart={handleOnboardingStart} />
        </>
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
      <>
        <Layout step={step} setStep={setStep} trackEvent={trackEvent} activeApp={activeApp} setActiveApp={setActiveApp} onOpenNoteManager={() => setIsNoteManagerOpen(true)}>
          {activeApp === 'plan' ? (
            <>
              {step === 1 && (
                <ObjectiveView objectives={objectives} setObjectives={setObjectives} onNext={handleNext} />
              )}
              {step === 2 && (
                <ConstraintsView schedule={schedule} setSchedule={setSchedule} onNext={handleNext} trackEvent={trackEvent} />
              )}
              {step === 3 && (
                <TasksView
                  objectives={objectives}
                  tasks={tasks}
                  setTasks={setTasks}
                  onNext={handleNext}
                  trackEvent={trackEvent}
                  showToast={showToast}
                />
              )}
              {step === 4 && (
                <PlanningView objectives={objectives} tasks={tasks} setTasks={setTasks} schedule={schedule} onNext={handleNext} trackEvent={trackEvent} />
              )}
              {step === 5 && (
                <Dashboard
                  objectives={objectives}
                  tasks={tasks}
                  notes={notes}
                  setTasks={setTasks}
                  onResetProgress={handleResetProgress}
                  onClearAll={handleClearAll}
                  onNavigateToNote={handleNavigateToNote}
                  trackEvent={trackEvent}
                  showToast={showToast}
                />
              )}
            </>
          ) : (
            <NoteView
              notes={notes}
              setNotes={setNotes}
              tasks={tasks}
              objectives={objectives}
              noteCategories={noteCategories}
              initialNoteId={noteToView}
              onNoteViewed={() => setNoteToView(null)}
            />
          )}
          <Toast message={toast.message} isVisible={toast.visible} onClose={hideToast} type={toast.type} />
        </Layout>
        <NoteManagementModal
          isOpen={isNoteManagerOpen}
          onClose={() => setIsNoteManagerOpen(false)}
          notes={notes}
          setNotes={setNotes}
          categories={noteCategories}
          setCategories={setNoteCategories}
        />
      </>
    );
  };

  return (
    <ErrorBoundary>
      {renderApp()}
    </ErrorBoundary>
  );
};

export default App;