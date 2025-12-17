import React, { useState, useMemo } from 'react';
import { Note, NoteCategory } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  categories: NoteCategory[];
  setCategories: (categories: NoteCategory[]) => void;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const NoteManagementModal: React.FC<Props> = ({ isOpen, onClose, notes, setNotes, categories, setCategories }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#A78BFA');
  
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [notes]);

  const handleEditClick = (id: string, initialValue: string) => {
    setEditingId(id);
    setEditingValue(initialValue);
  };

  // Category Handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory: NoteCategory = {
      id: generateId(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
  };
  
  const handleUpdateCategory = (id: string, updates: Partial<Pick<NoteCategory, 'name' | 'color'>>) => {
     setCategories(categories.map(c => c.id === id ? {...c, ...updates} : c));
  };

  const handleDeleteCategory = (id: string) => {
    if (categories.length <= 1) {
        alert("Vous ne pouvez pas supprimer la dernière catégorie.");
        return;
    }
    if (window.confirm("Supprimer cette catégorie ? Les notes associées seront déplacées vers 'Autre'.")) {
      const defaultCategory = categories.find(c => c.id === 'autre') || categories.find(c => c.id !== id);
      setNotes(notes.map(note => note.categoryId === id ? { ...note, categoryId: defaultCategory!.id } : note));
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  // Tag Handlers
  const handleUpdateTag = (oldTag: string) => {
    const newTag = editingValue.trim().toLowerCase().replace(/\s+/g, '-');
    if (!newTag || newTag === oldTag) {
        setEditingId(null);
        return;
    }
    setNotes(notes.map(note => ({
        ...note,
        tags: note.tags.map(t => t === oldTag ? newTag : t)
    })));
    setEditingId(null);
  };

  const handleDeleteTag = (tagToDelete: string) => {
    if(window.confirm(`Supprimer le tag "#${tagToDelete}" de toutes les notes ?`)){
        setNotes(notes.map(note => ({
            ...note,
            tags: note.tags.filter(t => t !== tagToDelete)
        })));
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col h-[80vh] animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gérer les Notes</h2>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:bg-slate-600 rounded-full"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        {/* Tabs */}
        <div className="p-2 bg-slate-100 dark:bg-slate-800 flex gap-2 flex-shrink-0">
            <button onClick={() => setActiveTab('categories')} className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-white text-indigo-600 dark:bg-slate-700' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700/50'}`}>Catégories</button>
            <button onClick={() => setActiveTab('tags')} className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${activeTab === 'tags' ? 'bg-white text-indigo-600 dark:bg-slate-700' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700/50'}`}>Tags</button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'categories' && (
                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Nouvelle Catégorie</h3>
                        <div className="flex gap-2">
                            <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nom" className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900"/>
                            <input type="color" value={newCategoryColor} onChange={e => setNewCategoryColor(e.target.value)} className="w-10 h-9 p-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900"/>
                            <button onClick={handleAddCategory} className="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-md text-sm hover:bg-indigo-700">Ajouter</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {categories.map(cat => (
                           <div key={cat.id} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                               <input type="color" value={cat.color} onChange={e => handleUpdateCategory(cat.id, { color: e.target.value })} className="w-8 h-8 p-1 border-none rounded bg-transparent"/>
                               <input type="text" value={cat.name} onChange={e => handleUpdateCategory(cat.id, { name: e.target.value })} className="flex-1 bg-transparent font-medium text-slate-800 dark:text-slate-200 text-sm focus:outline-none"/>
                               <button onClick={() => handleDeleteCategory(cat.id)} disabled={cat.id === 'autre'} className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                           </div>
                        ))}
                    </div>
                </div>
            )}
            {activeTab === 'tags' && (
                <div className="space-y-2">
                    {allTags.map(tag => (
                        <div key={tag} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                           {editingId === tag ? (
                             <input type="text" value={editingValue} onChange={e => setEditingValue(e.target.value)} onBlur={() => handleUpdateTag(tag)} onKeyDown={e => e.key === 'Enter' && handleUpdateTag(tag)} autoFocus className="flex-1 bg-slate-100 dark:bg-slate-700 font-medium text-slate-800 dark:text-slate-200 text-sm focus:outline-none px-2 py-1 rounded-md"/>
                           ) : (
                             <span className="flex-1 font-medium text-slate-600 dark:text-slate-300 text-sm">#{tag}</span>
                           )}
                           <button onClick={() => handleEditClick(tag, tag)} className="p-2 text-slate-400 hover:text-indigo-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                           <button onClick={() => handleDeleteTag(tag)} className="p-2 text-slate-400 hover:text-rose-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    ))}
                    {allTags.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Aucun tag utilisé.</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};