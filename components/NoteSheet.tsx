import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Note, NoteCategory, Task, Objective } from '../types';
import { LinkTaskModal } from './LinkTaskModal';

interface Props {
  note: Note;
  noteCategories: NoteCategory[];
  tasks: Task[];
  objectives: Objective[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onFocus: () => void;
  style: React.CSSProperties;
  isActive: boolean;
  isMobile: boolean;
}

const EditorToolbar: React.FC<{ activeFormats: Record<string, boolean | string>, onCommand: (cmd: string, val?: string) => void }> = ({ activeFormats, onCommand }) => {
  const formatOptions = ['bold', 'italic', 'underline'];
  const blockOptions = [
    { label: 'Paragraphe', value: 'p' },
    { label: 'Titre 1', value: 'h1' },
    { label: 'Titre 2', value: 'h2' },
  ];
  
  const handleMouseDown = (e: React.MouseEvent) => e.preventDefault();
  
  return (
    <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 flex items-center gap-1 flex-wrap bg-slate-50 dark:bg-slate-900/50">
      <select
        value={activeFormats.blockType as string || 'p'}
        onChange={e => onCommand('formatBlock', e.target.value)}
        onMouseDown={handleMouseDown}
        className="text-xs px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white text-slate-900 dark:bg-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
      >
        {blockOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
      {formatOptions.map(format => (
        <button key={format} onMouseDown={handleMouseDown} onClick={() => onCommand(format)} className={`p-2 rounded-md transition-colors ${activeFormats[format] ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {format === 'bold' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-4-12h4m4 0h-4m0 12h4m-4-4h4" />}
            {format === 'italic' && <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-12 4 12" />}
            {format === 'underline' && <path strokeLinecap="round" strokeLinejoin="round" d="M4 18h16M6 4v7a6 6 0 0012 0V4" />}
          </svg>
        </button>
      ))}
       <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
       <button onMouseDown={handleMouseDown} onClick={() => onCommand('insertUnorderedList')} className={`p-2 rounded-md transition-colors ${activeFormats.ul ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
       </button>
       <button onMouseDown={handleMouseDown} onClick={() => onCommand('insertOrderedList')} className={`p-2 rounded-md transition-colors ${activeFormats.ol ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16M7 4v16" /></svg>
       </button>
    </div>
  );
};


export const NoteSheet: React.FC<Props> = ({ note, noteCategories, tasks, objectives, onUpdate, onDelete, onClose, onFocus, style, isActive, isMobile }) => {
  const [newTag, setNewTag] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean | string>>({});

  const linkedTask = tasks.find(t => t.id === note.linkedTaskId);

  const updateActiveFormats = useCallback(() => {
    const formats: Record<string, boolean | string> = {};
    formats.bold = document.queryCommandState('bold');
    formats.italic = document.queryCommandState('italic');
    formats.underline = document.queryCommandState('underline');
    formats.ul = document.queryCommandState('insertUnorderedList');
    formats.ol = document.queryCommandState('insertOrderedList');
    
    let blockType = document.queryCommandValue('formatBlock').toLowerCase();
    if (!['p', 'h1', 'h2'].includes(blockType)) blockType = 'p';
    formats.blockType = blockType;

    setActiveFormats(formats);
  }, []);
  
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateActiveFormats();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveFormats]);


  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    onUpdate(note.id, { content: e.currentTarget.innerHTML });
  };
  
  const handleAddTag = () => {
    const tagToAdd = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tagToAdd) return;
    if (!note.tags.includes(tagToAdd) && note.tags.length < 10) {
      onUpdate(note.id, { tags: [...note.tags, tagToAdd] });
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate(note.id, { tags: note.tags.filter(t => t !== tagToRemove) });
  };
  
  const handleLinkTask = (taskId: string | null) => {
    onUpdate(note.id, { linkedTaskId: taskId });
    setIsLinkModalOpen(false);
  };

  const isContentEmpty = (html: string): boolean => {
    if (!html) return true;
    const tempEl = document.createElement('div');
    tempEl.innerHTML = html;
    return (tempEl.textContent || tempEl.innerText || "").trim() === "";
  };

  return (
    <>
      <div
        style={style}
        onClick={onFocus}
        className={`
          bg-white dark:bg-slate-800 flex flex-col overflow-hidden
          ${isMobile
            ? 'fixed inset-0 z-50 animate-slide-up'
            : `absolute rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 
               transition-all duration-300 ease-out
               md:w-[calc(100%-2rem)] md:h-[calc(100%-2rem)] md:max-w-2xl inset-0 md:inset-auto 
               ${isActive ? 'z-20' : 'z-10'}`
          }
        `}
      >
        <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2 mb-3">
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <input 
                  type="text"
                  value={note.title}
                  onChange={(e) => onUpdate(note.id, { title: e.target.value })}
                  placeholder="Titre de la note"
                  className="w-full bg-transparent text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
              />
          </div>
          <div className="flex items-center gap-4">
             <select
                value={note.categoryId}
                onChange={(e) => onUpdate(note.id, { categoryId: e.target.value })}
                className="w-1/2 text-sm px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white text-slate-900 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
             >
                {noteCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
             </select>
             <div className="text-xs text-slate-400 dark:text-slate-500 text-right flex-1">
                {new Date(note.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
        </div>
        
        <EditorToolbar activeFormats={activeFormats} onCommand={handleCommand} />
        
        <div className="flex-1 min-h-0 relative overflow-y-auto custom-scrollbar">
            <div
                ref={editorRef}
                contentEditable="true"
                suppressContentEditableWarning={true}
                onInput={handleContentChange}
                onFocus={updateActiveFormats}
                onKeyUp={updateActiveFormats}
                onClick={updateActiveFormats}
                dangerouslySetInnerHTML={{ __html: note.content }}
                className="p-4 w-full focus:outline-none text-slate-700 dark:text-slate-300 resize-none leading-relaxed prose dark:prose-invert max-w-none"
            />
            {isContentEmpty(note.content) && (
                <div className="absolute top-4 left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
                Commencez à écrire...
                </div>
            )}
        </div>
        
        <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-50 dark:bg-slate-900/50 space-y-3">
           <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {note.tags.map(tag => (
                  <span key={tag} className="flex items-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium px-2 py-1 rounded-full">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 -mr-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-base leading-none">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Ajouter un tag..."
                className="w-full text-sm px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white text-slate-900 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
           </div>
           
           {linkedTask ? (
             <div className="flex items-center justify-between gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <div className="min-w-0">
                  <span className="text-xs text-indigo-800 dark:text-indigo-200 font-semibold block">Lié à la tâche :</span>
                  <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium truncate">{linkedTask.title}</p>
                </div>
                <button onClick={() => handleLinkTask(null)} className="flex-shrink-0 text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold p-1">
                  Délier
                </button>
             </div>
           ) : (
            <button onClick={() => setIsLinkModalOpen(true)} className="w-full text-center py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                Lier à une tâche...
            </button>
           )}
           <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="w-full text-center py-1 text-xs text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold">
              Supprimer la note
            </button>
        </div>
      </div>
      {isLinkModalOpen && (
        <LinkTaskModal 
            isOpen={isLinkModalOpen}
            onClose={() => setIsLinkModalOpen(false)}
            tasks={tasks}
            objectives={objectives}
            onLinkTask={handleLinkTask}
        />
       )}
    </>
  );
};