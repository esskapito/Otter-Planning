import { Category } from './types';

export const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
export const HOURS_OF_DAY = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM for simplicity in view

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.ETUDE]: '#A78BFA', // Pastel Violet
  [Category.EXERCICE]: '#6EE7B7', // Pastel Mint
  [Category.RECHERCHE]: '#F472B6', // Pastel Pink
  [Category.CREATION]: '#FCD34D', // Pastel Amber
  [Category.AUTRE]: '#94A3B8', // Pastel Slate
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  [Category.ETUDE]: '📚',
  [Category.EXERCICE]: '💪',
  [Category.RECHERCHE]: '🔍',
  [Category.CREATION]: '✨',
  [Category.AUTRE]: '🎲',
};

// Pastel-ish colors for objectives to distinct them
export const OBJECTIVE_COLORS = [
  '#93C5FD', // Pastel Blue
  '#FCA5A5', // Pastel Red
  '#6EE7B7', // Pastel Emerald
  '#FCD34D', // Pastel Amber
  '#A78BFA', // Pastel Violet
  '#F9A8D4', // Pastel Pink
  '#67E8F9', // Pastel Cyan
  '#FDBA74', // Pastel Orange
];