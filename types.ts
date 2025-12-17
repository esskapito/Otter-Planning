export enum Category {
  ETUDE = 'Étude',
  EXERCICE = 'Exercice',
  RECHERCHE = 'Recherche',
  CREATION = 'Création',
  AUTRE = 'Autre'
}

export enum TaskStatus {
  PENDING = 'À faire',
  COMPLETED = 'Fait',
  SKIPPED = 'Zappé'
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

export interface Objective {
  id: string;
  title: string;
  type: 'week' | 'month';
  description: string;
  color: string; // Hex color for UI distinction
}

export interface Subtask {
  id: string;
  title: string;
  completedInSlots: string[];
}

export interface Task {
  id: string;
  objectiveId: string; // Link to specific objective
  title: string;
  category: Category;
  durationMinutes: number;
  status: TaskStatus; // General status for the task definition
  
  // Repetition & Scheduling
  repeatCount: number;      // How many times it should be done per week
  scheduledSlots: string[]; // Array of "day-hour" strings
  completedSlots: string[]; // Array of "day-hour" strings that are completed
  isRecurring: boolean;     // If true, the task resets every week. If false, it's one-off.
  
  subtasks: Subtask[];
}

export interface NoteCategory {
  id: string;
  name: string;
  color: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  linkedTaskIds: string[];
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  categoryId: string;
  tags: string[];
}

export interface ScheduleSlot {
  id: string;
  dayIndex: number; // 0 (Mon) - 6 (Sun)
  hour: number; // 0 - 23
  isBlocked: boolean; // Constraint
}

export interface AppState {
  objectives: Objective[];
  tasks: Task[];
  schedule: ScheduleSlot[];
  notes: Note[];
  currentStep: number;
}