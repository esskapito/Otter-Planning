import React, { useState, useEffect, useMemo } from 'react';
import { Note, Task, Objective, NoteCategory } from '../types';
import { NoteSheet } from './NoteSheet';

interface Props {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  tasks: Task[];
  objectives: Objective[];
  noteCategories: NoteCategory[];
  initialNoteId: string | null;
  onNoteViewed: () => void;
  onOpenNoteManager: () => void;
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

export const NoteView: React.FC<Props> = ({ notes, setNotes, tasks, objectives, noteCategories, initialNoteId, onNoteViewed, onOpenNoteManager }) => {
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (initialNoteId) {
      handleOpenNote(initialNoteId);
      onNoteViewed();
    }
  }, [initialNoteId]);

  const filteredNotes = useMemo(() => {
    const sorted = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sorted.filter(note => {
      const categoryMatch = categoryFilter === 'all' || note.categoryId === categoryFilter;
      const searchMatch = (() => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        if (lowerSearch.startsWith('#')) {
          const searchTag = lowerSearch.substring(1);
          if (!searchTag) return true;
          return note.tags.some(tag => tag.toLowerCase().includes(searchTag));
        }
        return note.title.toLowerCase().includes(lowerSearch) || stripHtml(note.content).toLowerCase().includes(lowerSearch);
      })();
      return categoryMatch && searchMatch;
    });
  }, [notes, searchTerm, categoryFilter]);

  const getCategory = (categoryId: string) => {
    return noteCategories.find(c => c.id === categoryId) || noteCategories.find(c => c.id === 'autre');
  };

  const createNewNote = () => {
    const defaultCategory = noteCategories.find(c => c.id === 'autre') || noteCategories[0];
    const newNote: Note = {
      id: generateId(),
      title: 'Nouvelle note',
      content: '',
      linkedTaskIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categoryId: defaultCategory.id,
      tags: [],
    };
    setNotes(prev => [newNote, ...prev]);
    handleOpenNote(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      handleCloseNote(id, true);
    }
  };

  const handleOpenNote = (noteId: string) => {
    setOpenNoteIds(prev => {
      if (isMobile) return [noteId];
      const filtered = prev.filter(id => id !== noteId);
      return [...filtered, noteId];
    });
  };

  const handleCloseNote = (noteId: string, isDeleting = false) => {
    setOpenNoteIds(prev => prev.filter(id => id !== noteId));
    if (isDeleting) {
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }
  };

  const renderNoteList = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 md:rounded-xl md:shadow-sm md:border md:border-slate-200 md:dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 space-y-3">
        <div className="flex items-center gap-2">
            <input 
                type="text" 
                placeholder="Rechercher ou filtrer (#tag)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
            />
            <button 
                onClick={createNewNote}
                className="flex-shrink-0 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                title="Créer une nouvelle note"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
            <button 
                onClick={onOpenNoteManager}
                className="hidden md:flex flex-shrink-0 p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
                title="Gérer les catégories et tags"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"></path></svg>
            </button>
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full text-sm px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white text-slate-900 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="all">Toutes les catégories</option>
          {noteCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>
      <div className="overflow-y-auto custom-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            <p>{searchTerm || categoryFilter !== 'all' ? 'Aucune note trouvée.' : 'Créez votre première note !'}</p>
          </div>
        ) : (
          <ul className="p-2 space-y-1">
            {filteredNotes.map(note => {
              const category = getCategory(note.categoryId);
              const plainContent = stripHtml(note.content);
              return (
              <li key={note.id}>
                <button 
                  onClick={() => handleOpenNote(note.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${openNoteIds.includes(note.id) ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold truncate pr-2 ${openNoteIds.includes(note.id) ? 'text-indigo-800 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>{note.title || 'Note sans titre'}</h3>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: category?.color }}></div>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-1">{plainContent || 'Aucun contenu'}</p>
                </button>
              </li>
            )})}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 h-full flex md:gap-4 overflow-hidden">
      <div className={`w-full md:w-1/3 md:min-w-[280px] h-full ${openNoteIds.length > 0 && isMobile ? 'hidden' : 'block'}`}>
        {renderNoteList()}
      </div>

      <div className={`relative flex-1 h-full ${openNoteIds.length === 0 ? 'hidden md:block' : 'block'}`}>
        {openNoteIds.length === 0 && !isMobile && (
          <div className="h-full hidden md:flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
            <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="font-semibold">Sélectionnez une note</h3>
            <p className="text-sm max-w-xs">Ou créez-en une nouvelle pour commencer.</p>
          </div>
        )}
        
        {openNoteIds.map((noteId, index) => {
          const note = notes.find(n => n.id === noteId);
          if (!note) return null;

          const stackIndex = openNoteIds.length - 1 - index;
          const isActive = index === openNoteIds.length - 1;
          
          const style: React.CSSProperties = isMobile ? {} : {
              transform: `scale(${isActive ? 1 : 1 - Math.min(stackIndex, 3) * 0.05}) translateX(${isActive ? 0 : -stackIndex * 10}px)`,
              opacity: isActive ? 1 : 1 - Math.min(stackIndex, 3) * 0.2,
              zIndex: 10 + index,
              pointerEvents: isActive ? 'auto' : 'none',
              height: '100%'
          };

          return (
            <NoteSheet
              key={note.id}
              note={note}
              noteCategories={noteCategories}
              tasks={tasks}
              objectives={objectives}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onClose={() => handleCloseNote(note.id)}
              onFocus={() => handleOpenNote(note.id)}
              style={style}
              isActive={isActive}
              isMobile={isMobile}
            />
          );
        })}
      </div>
    </div>
  );
};