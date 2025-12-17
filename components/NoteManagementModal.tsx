import React, { useState, useMemo } from 'react';
import { Note, NoteCategory } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  categories: NoteCategory[];
  setCategories: React.Dispatch<React.SetStateAction<NoteCategory[]>>;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const NoteManagementModal: React.FC<Props> = ({ isOpen, onClose, notes, setNotes, categories, setCategories }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
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
    setConfirmingDeleteId(null);
    setEditingValue(initialValue);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCategory: NoteCategory = {
      id: generateId(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };
    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
  };

  const handleUpdateCategoryName = (id: string) => {
    const newName = editingValue.trim();
    if (!newName || !editingId) {
      setEditingId(null);
      return;
    }
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, name: newName } : c)));
    setEditingId(null);
  };
  
  const handleUpdateCategoryColor = (id: string, color: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, color } : c));
  };

  const executeDeleteCategory = (idToDelete: string) => {
    if (idToDelete === 'autre') return;

    // 1. Move notes to 'autre'
    setNotes(prevNotes => prevNotes.map(note => 
      note.categoryId === idToDelete 
        ? { ...note, categoryId: 'autre' } 
        : note
    ));

    // 2. Remove the category
    setCategories(prevCategories => prevCategories.filter(c => c.id !== idToDelete));
    setConfirmingDeleteId(null);
  };

  const handleUpdateTag = (oldTag: string) => {
    const newTag = editingValue.trim().toLowerCase().replace(/\s+/g, '-');
    if (!newTag || newTag === oldTag) {
        setEditingId(null);
        return;
    }
    setNotes(prevNotes => prevNotes.map(note => ({
        ...note,
        tags: note.tags.map(t => t === oldTag ? newTag : t)
    })));
    setEditingId(null);
  };

  const executeDeleteTag = (tagToDelete: string) => {
    setNotes(prevNotes => prevNotes.map(note => ({
        ...note,
        tags: note.tags.filter(t => t !== tagToDelete)
    })));
    setConfirmingDeleteId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col h-[80vh] animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Gérer les Notes</h2>
            <button type="button" onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        {/* Tabs */}
        <div className="p-2 bg-slate-100 dark:bg-slate-800 flex gap-2 flex-shrink-0">
            <button type="button" onClick={() => { setActiveTab('categories'); setConfirmingDeleteId(null); setEditingId(null); }} className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${activeTab === 'categories' ? 'bg-white text-indigo-600 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700/50'}`}>Catégories</button>
            <button type="button" onClick={() => { setActiveTab('tags'); setConfirmingDeleteId(null); setEditingId(null); }} className={`flex-1 text-sm font-semibold py-2 rounded-lg transition-colors ${activeTab === 'tags' ? 'bg-white text-indigo-600 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700/50'}`}>Tags</button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'categories' && (
                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Nouvelle Catégorie</h3>
                        <div className="flex gap-2">
                            <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Nom" className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"/>
                            <input type="color" value={newCategoryColor} onChange={e => setNewCategoryColor(e.target.value)} className="w-10 h-9 p-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 cursor-pointer"/>
                            <button type="button" onClick={handleAddCategory} className="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-md text-sm hover:bg-indigo-700">Ajouter</button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {categories.map(cat => (
                           <div key={cat.id} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 group hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all">
                               <input type="color" value={cat.color} onChange={e => handleUpdateCategoryColor(cat.id, e.target.value)} className="w-8 h-8 p-1 border-none rounded bg-transparent cursor-pointer flex-shrink-0"/>
                               {editingId === cat.id ? (
                                 <input
                                    type="text"
                                    value={editingValue}
                                    onChange={e => setEditingValue(e.target.value)}
                                    onBlur={() => handleUpdateCategoryName(cat.id)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleUpdateCategoryName(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                                    autoFocus
                                    className="flex-1 bg-slate-100 dark:bg-slate-700 font-medium text-slate-800 dark:text-slate-200 text-sm focus:outline-none px-2 py-1 rounded-md"
                                 />
                               ) : (
                                <span onClick={() => cat.id !== 'autre' && handleEditClick(cat.id, cat.name)} className={`flex-1 font-medium text-slate-800 dark:text-slate-200 text-sm truncate px-2 py-1 ${cat.id !== 'autre' ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors' : ''}`}>
                                   {cat.name}
                                </span>
                               )}
                               
                               {cat.id !== 'autre' && (
                                 <div className="flex items-center gap-1">
                                    {confirmingDeleteId === cat.id ? (
                                        <div className="flex items-center gap-1 animate-fade-in">
                                            <button 
                                                type="button" 
                                                onClick={(e) => { e.stopPropagation(); executeDeleteCategory(cat.id); }}
                                                className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700 uppercase"
                                            >
                                                Supprimer ?
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }}
                                                className="px-2 py-1 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 uppercase"
                                            >
                                                Non
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(cat.id, cat.name); }} 
                                                className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-white dark:hover:bg-slate-700" 
                                                aria-label={`Modifier ${cat.name}`}
                                            >
                                                <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(cat.id); setEditingId(null); }} 
                                                className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700" 
                                                aria-label={`Supprimer ${cat.name}`}
                                            >
                                                <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    )}
                                 </div>
                               )}
                           </div>
                        ))}
                    </div>
                </div>
            )}
            {activeTab === 'tags' && (
                <div className="space-y-2">
                    {allTags.map(tag => (
                        <div key={tag} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 group hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all">
                           {editingId === tag ? (
                             <input type="text" value={editingValue} onChange={e => setEditingValue(e.target.value)} onBlur={() => handleUpdateTag(tag)} onKeyDown={e => e.key === 'Enter' && handleUpdateTag(tag)} autoFocus className="flex-1 bg-slate-100 dark:bg-slate-700 font-medium text-slate-800 dark:text-slate-200 text-sm focus:outline-none px-2 py-1 rounded-md"/>
                           ) : (
                             <span className="flex-1 font-medium text-slate-600 dark:text-slate-300 text-sm px-2 py-1">#{tag}</span>
                           )}
                           <div className="flex items-center gap-1">
                                {confirmingDeleteId === tag ? (
                                    <div className="flex items-center gap-1 animate-fade-in">
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); executeDeleteTag(tag); }}
                                            className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700 uppercase"
                                        >
                                            Supprimer ?
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(null); }}
                                            className="px-2 py-1 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 uppercase"
                                        >
                                            Non
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleEditClick(tag, tag); }} 
                                            className="p-2 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-white dark:hover:bg-slate-700" 
                                            aria-label={`Modifier le tag ${tag}`}
                                        >
                                            <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setConfirmingDeleteId(tag); setEditingId(null); }} 
                                            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-700" 
                                            aria-label={`Supprimer le tag ${tag}`}
                                        >
                                            <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                )}
                           </div>
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