import React, { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, Undo2, Edit, Eye, MoreVertical, ClipboardCopy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';    // Renders Markdown as HTML
import remarkGfm from 'remark-gfm';          // Adds support for GitHub Flavored Markdown (tables, etc.)
import type { Note } from '../types/note';
import { useAppContext } from '../context/AppContext';

// This component no longer needs to define a Props interface.
const NoteEditor: React.FC = () => {
  // Get the active note and all necessary actions directly from the context.
  const { activeNote, actions } = useAppContext();
  
  // Internal UI state to manage the editor/preview layout
  // const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isEditing, setIsEditing] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

   useEffect(() => {
    // We only want to switch to edit mode, not preview mode, on note change.
    setIsEditing(true);
  }, [activeNote?.id]); 

  const handleCopyToClipboard = () => {
    if (!activeNote) return;
    const markdownContent = `# ${activeNote.title}\n\n${activeNote.body}`;
    navigator.clipboard.writeText(markdownContent)
      .then(() => {
        // Optional: Add a brief "Copied!" message or toast notification here
        alert("Note copied to clipboard!"); 
      })
      .catch(err => console.error('Failed to copy text: ', err));
    setIsMenuOpen(false); // Close menu after action
  };


  const handleDownload = () => {
    if (!activeNote) return;
    const markdownContent = `# ${activeNote.title}\n\n${activeNote.body}`;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Sanitize title to create a valid filename
    const fileName = `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsMenuOpen(false); // Close menu after action
  };

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [closeMenu]);


  // If there's no active note, display a placeholder message.
  if (!activeNote) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white text-gray-400 text-2xl p-8 text-center">
        Select a note to view or create a new one.
      </div>
    );
  }

  // A single, reusable handler for updating any field on the note.
  const onEditField = (key: keyof Note, value: string) => {
    actions.handleUpdateNote({
      ...activeNote,
      [key]: value,
      lastModified: Date.now(),
    });
  };

  const isTrashed = activeNote.trashed;

  return (
    <div className="flex-grow flex flex-col">
      {/* Editor Toolbar */}
            <div className="p-3 border-b border-gray-300 flex items-center justify-end bg-gray-50 flex-shrink-0">
        {/* The left side is now empty. The entire content is on the right. */}
        <div className="flex items-center space-x-4">
          
          {/* --- MOVED & MODIFIED: The new Edit/Preview toggle button --- */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
            title={isEditing ? "Preview Note" : "Edit Note"}
          >
            {isEditing ? (
              <Eye size={20} />
            ) : (
              <Edit size={20} />
            )}
          </button>
          
          {/* Separator */}
          <div className="w-[1px] h-6 bg-gray-300"></div>

          {/* Existing Favorite button is unchanged */}
          <button
            onClick={() => actions.handleToggleFavorite(activeNote.id)}
            title={activeNote.favorited ? "Unfavorite" : "Favorite"}
            className="text-gray-600 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400 transition-colors duration-200 disabled:opacity-50"
            disabled={isTrashed}
          >
            <Star
              size={20}
              className={activeNote.favorited ? 'text-yellow-500' : ''}
              fill={activeNote.favorited ? 'currentColor' : 'none'}
            />
          </button>
          
          {/* Existing Trash/Restore buttons are unchanged */}
          {isTrashed ? (
            <>
              <button onClick={() => actions.handleRestoreNote(activeNote.id)} title="Restore" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"><Undo2 size={20} /></button>
              <button onClick={() => actions.handlePermanentlyDeleteNote(activeNote.id)} title="Permanently Delete" className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"><Trash2 size={20} /></button>
            </>
          ) : (
            <button onClick={() => actions.handleDeleteNote(activeNote.id)} title="Move to Trash" className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"><Trash2 size={20} /></button>
          )}

{/* --- NEW: 3-Dot Dropdown Menu --- */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent the global click listener from closing the menu instantly
                setIsMenuOpen(!isMenuOpen);
              }}
              className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
              title="More options"
            >
              <MoreVertical size={20} />
            </button>
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 shadow-lg rounded-md py-1 border border-gray-200 dark:border-gray-600 animate-fade-in-fast z-20"
              >
                <button
                  onClick={handleCopyToClipboard}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center transition-colors duration-150"
                >
                  <ClipboardCopy size={16} className="mr-3" /> Copy as Markdown
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center transition-colors duration-150"
                >
                  <Download size={16} className="mr-3" /> Download as .md file
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Editor Fields & Preview */}
      <div className="flex-grow p-6 overflow-y-auto">
        {isEditing ? (
          // --- EDIT MODE ---
          <div className="flex flex-col h-full">
            <input
              type="text"
              value={activeNote.title}
              onChange={(e) => onEditField('title', e.target.value)}
              className="text-3xl font-bold p-2 focus:outline-none mb-4 bg-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 rounded"
              placeholder="Title"
              autoFocus
              disabled={isTrashed}
            />
            <textarea
              placeholder="Start writing your note in Markdown..."
              value={activeNote.body}
              onChange={(e) => onEditField('body', e.target.value)}
              className="flex-grow p-2 text-lg focus:outline-none resize-none bg-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 rounded font-mono"
              disabled={isTrashed}
            />
          </div>
        ) : (
          // --- PREVIEW MODE ---
          <div>
            <h1 className="text-3xl font-bold p-2 mb-4 border-b border-gray-200 dark:border-gray-700">{activeNote.title}</h1>
            <article className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {activeNote.body || "*Start writing to see a preview...*"}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;