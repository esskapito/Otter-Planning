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
    { label: 'Paragraphe', value: 'p' },
    { label: 'Titre 1', value: 'h1' },
    { label: 'Titre 2', value: 'h2' },
    { label: 'Titre 3', value: 'h3' },
    { label: 'Titre 4', value: 'h4' },
  ];

  return (
    <div className="flex-none flex items-center gap-1 flex-wrap p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <select
        value={activeFormats.blockType as string || 'p'}
        onChange={e => onCommand('formatBlock', e.target.value)}
        className="text-xs px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white text-slate-900 dark:bg-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
      >
        {blockOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      
      <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>
      
      <button onMouseDown={handleMouseDown} onClick={() => onCommand('bold')} className={`p-1.5 rounded transition-colors ${activeFormats['bold'] ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" /></svg>
      </button>
      <button onMouseDown={handleMouseDown} onClick={() => onCommand('italic')} className={`p-1.5 rounded transition-colors ${activeFormats['italic'] ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" /></svg>
      </button>
      <button onMouseDown={handleMouseDown} onClick={() => onCommand('underline')} className={`p-1.5 rounded transition-colors ${activeFormats['underline'] ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" /></svg>
      </button>

      <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1"></div>

      <button onMouseDown={handleMouseDown} onClick={() => onCommand('insertUnorderedList')} className={`p-1.5 rounded transition-colors ${activeFormats['insertUnorderedList'] ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
      </button>
      <button onMouseDown={handleMouseDown} onClick={() => onCommand('insertOrderedList')} className={`p-1.5 rounded transition-colors ${activeFormats['insertOrderedList'] ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
         <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 11.9V11H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
      </button>
    </div>
  );
};

export const NoteSheet: React.FC<Props> = ({ note, noteCategories, tasks, objectives, onUpdate, onDelete, onClose, onFocus, style, isActive, isMobile }) => {
  const [newTag, setNewTag] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean | string>>({});

  const linkedTasks = tasks.filter(t => note.linkedTaskIds.includes(t.id));

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.PENDING:
            return <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">{TaskStatus.PENDING}</span>;
        case TaskStatus.COMPLETED:
            return <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">{TaskStatus.COMPLETED}</span>;
        case TaskStatus.SKIPPED:
            return <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">{TaskStatus.SKIPPED}</span>;
        default:
            return null;
    }
  };

  const updateActiveFormats = useCallback(() => {
    const formats: Record<string, boolean | string> = {};
    formats.bold = document.queryCommandState('bold');
    formats.italic = document.queryCommandState('italic');
    formats.underline = document.queryCommandState('underline');
    formats.insertUnorderedList = document.queryCommandState('insertUnorderedList');
    formats.insertOrderedList = document.queryCommandState('insertOrderedList');
    
    let blockType = document.queryCommandValue('formatBlock') || 'p';
    if (!['p', 'h1', 'h2', 'h3', 'h4'].includes(blockType.toLowerCase())) blockType = 'p';
    formats.blockType = blockType.toLowerCase();
    
    setActiveFormats(formats);
  }, []);
  
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && note.content !== editor.innerHTML) {
      editor.innerHTML = note.content;
    }
  }, [note.id, note.content]);

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
  
  const handleLinkTask = (taskId: string) => {
    if (!note.linkedTaskIds.includes(taskId)) {
      onUpdate(note.id, { linkedTaskIds: [...note.linkedTaskIds, taskId] });
    }
    setIsLinkModalOpen(false);
  };
  
  const handleUnlinkTask = (taskIdToRemove: string) => {
    onUpdate(note.id, { linkedTaskIds: note.linkedTaskIds.filter(id => id !== taskIdToRemove) });
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
            flex flex-col bg-white dark:bg-slate-800 overflow-hidden
            ${isMobile 
                ? 'fixed inset-0 z-50 animate-slide-up h-full w-full' 
                : `absolute rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-out 
                   inset-0 m-auto 
                   md:w-[calc(100%-2rem)] md:max-w-2xl 
                   md:h-[95%]
                   ${isActive ? 'z-20' : 'z-10'}`
            }
        `}
      >
        <div className="flex-none p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-slate-200 dark:border-slate-700">
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

        <div className="flex-1 relative min-h-0 bg-white dark:bg-slate-800">
             <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                <div
                    ref={editorRef}
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    onInput={handleContentChange}
                    onFocus={updateActiveFormats}
                    onKeyUp={updateActiveFormats}
                    onClick={updateActiveFormats}
                    className="min-h-full w-full p-4 focus:outline-none text-slate-700 dark:text-slate-300 resize-none leading-relaxed prose dark:prose-invert max-w-none"
                />
                 {isContentEmpty(note.content) && (
                    <div className="absolute top-4 left-4 text-slate-400 dark:text-slate-500 pointer-events-none select-none">
                       Commencez à écrire...
                    </div>
                )}
             </div>
        </div>

        <div className="flex-none p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 space-y-3 z-10">
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
           
           <div className="space-y-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Tâches liées :</span>
              {linkedTasks.length > 0 && (
                  <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                      {linkedTasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                              <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                      <p className="text-sm text-indigo-900 dark:text-indigo-100 font-medium truncate">{task.title}</p>
                                      {getStatusBadge(task.status)}
                                  </div>
                              </div>
                              <button onClick={() => handleUnlinkTask(task.id)} className="flex-shrink-0 text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold p-1">
                                  Délier
                              </button>
                          </div>
                      ))}
                  </div>
              )}
              <button onClick={() => setIsLinkModalOpen(true)} className="w-full text-center py-2 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                  Lier à une tâche...
              </button>
           </div>
           
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
            currentlyLinkedIds={note.linkedTaskIds}
        />
       )}
    </>
  );
};