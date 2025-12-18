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
import { AuthModal } from './components/AuthModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { Objective, Task, ScheduleSlot, Note, NoteCategory, User } from './types';
import { DEFAULT_NOTE_CATEGORIES } from './constants';
import { databaseService } from './services/databaseService';

const GUEST_STORAGE_KEY = 'rabbit_local_guest_data';
const AUTH_SESSION_KEY = 'rabbit_active_session';

const App = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [activeApp, setActiveApp] = useState<'plan' | 'note'>('plan');
  const [step, setStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
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

  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'error' }>({
    message: '',
    visible: false,
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, visible: true, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const hydrateStateFromData = (data: any) => {
    if (!data) return;
    const planData = data.plan || {};
    setObjectives(Array.isArray(planData.objectives) ? planData.objectives : []);
    setSchedule(Array.isArray(planData.schedule) ? planData.schedule : []);

    if (Array.isArray(planData.tasks)) {
       const validTasks = planData.tasks.map((t: any) => ({
         ...t,
         objectiveId: t.objectiveId,
         subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
         scheduledSlots: Array.isArray(t.scheduledSlots) ? t.scheduledSlots : [],
         completedSlots: Array.isArray(t.completedSlots) ? t.completedSlots : [],
         repeatCount: t.repeatCount || 1,
         isRecurring: t.isRecurring ?? true,
      })).filter((t: Task) => t.objectiveId);
      setTasks(validTasks);
    }
    
    setNoteCategories(Array.isArray(data.noteCategories) ? data.noteCategories : DEFAULT_NOTE_CATEGORIES);
    setNotes(Array.isArray(data.notes) ? data.notes : []);
  };

  useEffect(() => {
    const savedSession = localStorage.getItem(AUTH_SESSION_KEY);
    if (savedSession) {
      try {
        const user = JSON.parse(savedSession);
        setCurrentUser(user);
        databaseService.login(user.email, '').then(({ data }) => {
            hydrateStateFromData(data);
        }).catch(() => {
            const local = localStorage.getItem(GUEST_STORAGE_KEY);
            if (local) hydrateStateFromData(JSON.parse(local));
        });
      } catch (e) {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    }

    if (!localStorage.getItem('onboarding_complete') && !savedSession) {
      setShowOnboarding(true);
      setView('app');
    }
  }, []);

  useEffect(() => {
    if (!isSharedView && !templateToImport && view === 'app') {
      setIsSyncing(true);
      const dataToSave = {
        plan: { objectives, tasks, schedule },
        notes,
        noteCategories,
      };

      if (currentUser) {
          databaseService.saveUserData(currentUser.email, dataToSave);
      } else {
          localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(dataToSave));
      }
      
      const timer = setTimeout(() => setIsSyncing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [objectives, tasks, schedule, notes, noteCategories, isSharedView, templateToImport, view, currentUser]);

  const handleLoginSuccess = (user: User, data?: any) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    if (data) {
        hydrateStateFromData(data);
    }
    showToast(`Bon retour, ${user.name} ! Ton planning est à jour.`, 'success');
  };

  const handleLogout = () => {
    if (window.confirm("Se déconnecter ? Ton travail restera sauvegardé sur le Cloud.")) {
      setCurrentUser(null);
      localStorage.removeItem(AUTH_SESSION_KEY);
      setObjectives([]);
      setTasks([]);
      setSchedule([]);
      setNotes([]);
      showToast("Déconnecté.", 'success');
    }
  };

  const handleStartApp = () => {
    setView('app');
    window.history.pushState(null, '', '#app');
  };

  const renderApp = () => {
    if (view === 'landing') return <LandingPage onStart={handleStartApp} hasData={objectives.length > 0} />;
    
    if (showOnboarding) {
      return (
        <>
          <Layout 
            step={step} setStep={setStep} trackEvent={() => {}} activeApp={activeApp} setActiveApp={setActiveApp} 
            onOpenNoteManager={() => setIsNoteManagerOpen(true)}
            currentUser={currentUser} onOpenAuth={() => setIsAuthModalOpen(true)} onLogout={handleLogout}
            onOpenSettings={() => setIsSettingsModalOpen(true)} isSyncing={isSyncing}
          >
            <div/>
          </Layout>
          <OnboardingModal onStart={() => { setShowOnboarding(false); localStorage.setItem('onboarding_complete', 'true'); }} />
        </>
      );
    }

    if (isSharedView) return <SharedView objectives={objectives} tasks={tasks} />;

    return (
      <>
        <Layout 
          step={step} setStep={setStep} trackEvent={() => {}} activeApp={activeApp} setActiveApp={setActiveApp} 
          onOpenNoteManager={() => setIsNoteManagerOpen(true)}
          currentUser={currentUser} onOpenAuth={() => setIsAuthModalOpen(true)} onLogout={handleLogout}
          onOpenSettings={() => setIsSettingsModalOpen(true)} isSyncing={isSyncing}
        >
          {activeApp === 'plan' ? (
            <>
              {step === 1 && <ObjectiveView objectives={objectives} setObjectives={setObjectives} onNext={() => setStep(2)} />}
              {step === 2 && <ConstraintsView schedule={schedule} setSchedule={setSchedule} onNext={() => setStep(3)} trackEvent={() => {}} />}
              {step === 3 && <TasksView objectives={objectives} tasks={tasks} setTasks={setTasks} onNext={() => setStep(4)} trackEvent={() => {}} showToast={showToast} />}
              {step === 4 && <PlanningView objectives={objectives} tasks={tasks} setTasks={setTasks} schedule={schedule} onNext={() => setStep(5)} trackEvent={() => {}} />}
              {step === 5 && <Dashboard objectives={objectives} tasks={tasks} notes={notes} setTasks={setTasks} onResetProgress={() => {}} onClearAll={() => {}} onNavigateToNote={(id) => { setActiveApp('note'); setNoteToView(id); }} trackEvent={() => {}} showToast={showToast} />}
            </>
          ) : (
            <NoteView notes={notes} setNotes={setNotes} tasks={tasks} objectives={objectives} noteCategories={noteCategories} initialNoteId={noteToView} onNoteViewed={() => setNoteToView(null)} onOpenNoteManager={() => setIsNoteManagerOpen(true)} />
          )}
          <Toast message={toast.message} isVisible={toast.visible} onClose={hideToast} type={toast.type} />
        </Layout>
        <NoteManagementModal isOpen={isNoteManagerOpen} onClose={() => setIsNoteManagerOpen(false)} notes={notes} setNotes={setNotes} categories={noteCategories} setCategories={setNoteCategories} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={handleLoginSuccess} />
        {currentUser && (
          <AccountSettingsModal 
            isOpen={isSettingsModalOpen} 
            onClose={() => setIsSettingsModalOpen(false)} 
            currentUser={currentUser}
          />
        )}
      </>
    );
  };

  return <ErrorBoundary>{renderApp()}</ErrorBoundary>;
};

export default App;