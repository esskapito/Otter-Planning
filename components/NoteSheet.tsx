import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Note, NoteCategory, Task, Objective, TaskStatus } from '../types';
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
  const handleMouseDown = (e: React.MouseEvent) => e.preventDefault();
  
  const blockOptions = [
    { label: 'Texte', value: 'p' },
    { label: 'Titre 1', value: 'h1' },
    { label: 'Titre 2', value: 'h2' },
    { label: 'Titre 3', value: 'h3' },
  ];

  return (
    <div className="flex-none flex items-center gap-1 flex-wrap p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <select
        value={activeFormats.blockType as string || 'p'}
        onChange={e => onCommand('formatBlock', e.target.value)}
        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white text-slate-900 dark:bg-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
      >
        {blockOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      
      <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
      
      <button onMouseDown={handleMouseDown} onClick={() => onCommand('bold')} className={`p-1.5 rounded-lg transition-colors ${activeFormats['bold'] ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>
      </button>
      <button onMouseDown={handleMouseDown} onClick={() => onCommand('italic')} className={`p-1.5 rounded-lg transition-colors ${activeFormats['italic'] ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>
      </button>

      <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <button onMouseDown={handleMouseDown} onClick={() => onCommand('insertUnorderedList')} className={`p-1.5 rounded-lg transition-colors ${activeFormats['insertUnorderedList'] ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
      </button>
    </div>
  );
};

export const NoteSheet: React.FC<Props> = ({ note, noteCategories, tasks, objectives, onUpdate, onDelete, onClose, onFocus, style, isActive, isMobile }) => {
  const [newTag, setNewTag] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean | string>>({});

  const linkedTasks = tasks.filter(t => note.linkedTaskIds.includes(t.id));

  const updateActiveFormats = useCallback(() => {
    const formats: Record<string, boolean | string> = {};
    formats.bold = document.queryCommandState('bold');
    formats.italic = document.queryCommandState('italic');
    formats.insertUnorderedList = document.queryCommandState('insertUnorderedList');
    
    let blockType = document.queryCommandValue('formatBlock') || 'p';
    if (!['p', 'h1', 'h2', 'h3'].includes(blockType.toLowerCase())) blockType = 'p';
    formats.blockType = blockType.toLowerCase();
    
    setActiveFormats(formats);
  }, []);
  
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && note.content !== editor.innerHTML) {
      editor.innerHTML = note.content;
    }
  }, [note.id]);

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

  return (
    <>
      <div
        style={style}
        onClick={onFocus}
        className={`
            flex flex-col bg-white dark:bg-slate-800 overflow-hidden
            ${isMobile 
                ? 'fixed inset-0 z-[100] animate-slide-up h-full w-full' 
                : `absolute rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-out 
                   inset-x-0 mx-auto
                   md:w-[calc(100%-1rem)] md:max-w-2xl 
                   ${isActive ? 'z-20' : 'z-10'}`
            }
        `}
      >
        <div className={`
            flex-none px-4 pb-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800
            ${isMobile ? 'pt-20 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]' : 'pt-4'}
        `}>
           <div className="flex items-center gap-2 mb-3">
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <input 
                  type="text"
                  value={note.title}
                  onChange={(e) => onUpdate(note.id, { title: e.target.value })}
                  placeholder="Titre de la note"
                  className="w-full bg-transparent text-xl font-black text-slate-900 dark:text-white focus:outline-none"
              />
          </div>
          <div className="flex items-center gap-4">
             <select
                value={note.categoryId}
                onChange={(e) => onUpdate(note.id, { categoryId: e.target.value })}
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 focus:ring-1 focus:ring-indigo-500 outline-none"
             >
                {noteCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
             </select>
          </div>
        </div>

        <EditorToolbar activeFormats={activeFormats} onCommand={handleCommand} />

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800 p-4 sm:p-6">
            <div
                ref={editorRef}
                contentEditable="true"
                suppressContentEditableWarning={true}
                onInput={handleContentChange}
                onFocus={updateActiveFormats}
                onKeyUp={updateActiveFormats}
                onClick={updateActiveFormats}
                className="min-h-full w-full focus:outline-none text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none pb-20"
            />
        </div>

        <div className="flex-none p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-4">
           <div className="flex flex-wrap gap-2">
              {note.tags.map(tag => (
                <span key={tag} className="flex items-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  #{tag}
                  <button onClick={() => onUpdate(note.id, { tags: note.tags.filter(t => t !== tag) })} className="ml-2 text-slate-400 hover:text-rose-500 transition-colors">
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="+ tag"
                className="w-20 bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:text-indigo-500"
              />
           </div>
           
           <div className="flex items-center justify-between gap-4">
              <button onClick={() => setIsLinkModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-indigo-100 active:scale-95">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Lier ({note.linkedTaskIds.length})
              </button>
              
              <div className="flex items-center">
                {isDeleteConfirming ? (
                  <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} 
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      CONFIRMER ?
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsDeleteConfirming(false); }} 
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      ANNULER
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsDeleteConfirming(true); }} 
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-700 transition-colors"
                  >
                    Supprimer
                  </button>
                )}
              </div>
           </div>
        </div>
      </div>
      
      {isLinkModalOpen && (
        <LinkTaskModal 
            isOpen={isLinkModalOpen}
            onClose={() => setIsLinkModalOpen(false)}
            tasks={tasks}
            objectives={objectives}
            onLinkTask={(taskId) => {
              if (!note.linkedTaskIds.includes(taskId)) {
                onUpdate(note.id, { linkedTaskIds: [...note.linkedTaskIds, taskId] });
              }
              setIsLinkModalOpen(false);
            }}
            currentlyLinkedIds={note.linkedTaskIds}
        />
       )}
    </>
  );
};