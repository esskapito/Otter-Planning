import React, { useState } from 'react';
import { User } from '../types';
import { OBJECTIVE_COLORS } from '../constants';
import { databaseService } from '../services/databaseService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User, data?: any) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'signup' && !name)) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (mode === 'signup') {
        const avatarColor = OBJECTIVE_COLORS[Math.floor(Math.random() * OBJECTIVE_COLORS.length)];
        const user = await databaseService.signup(email, name, password, avatarColor);
        onLogin(user);
      } else {
        const { user, data } = await databaseService.login(email, password);
        onLogin(user, data);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Un problème est survenu lors de la connexion au Cloud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'login' ? 'Synchroniser' : 'Rejoindre le Cloud'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm px-4">
              {mode === 'login' 
                ? 'Retrouve ton planning sur n\'importe quel appareil.' 
                : 'Crée un compte pour sauvegarder tes plans automatiquement.'}