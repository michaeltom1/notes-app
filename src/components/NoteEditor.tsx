import React from 'react';
import type { Note } from '../types/note';
import { Star, Trash2, Undo2, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext'; // Import the custom hook

// This component no longer needs to define a Props interface.
const NoteEditor: React.FC = () => {
  // Get the active note and all necessary actions directly from the context.
  const { activeNote, actions } = useAppContext();

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
    <div className="flex-grow flex flex-col bg-white">
      {/* Editor Toolbar */}
      <div className="p-3 border-b border-gray-300 flex items-center justify-end bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => actions.handleToggleFavorite(activeNote.id)}
            title={activeNote.favorited ? "Unfavorite" : "Favorite"}
            className="text-gray-600 hover:text-yellow-500 transition-colors duration-200 disabled:opacity-50"
            disabled={isTrashed}
          >
            <Star
              size={20}
              className={activeNote.favorited ? 'text-yellow-500' : ''}
              fill={activeNote.favorited ? 'currentColor' : 'none'}
            />
          </button>
          
          {isTrashed ? (
            <>
              <button onClick={() => actions.handleRestoreNote(activeNote.id)} title="Restore" className="text-gray-600 hover:text-blue-500"><Undo2 size={20} /></button>
              <button onClick={() => actions.handlePermanentlyDeleteNote(activeNote.id)} title="Permanently Delete" className="text-gray-600 hover:text-red-600"><Trash2 size={20} /></button>
            </>
          ) : (
            <button onClick={() => actions.handleDeleteNote(activeNote.id)} title="Move to Trash" className="text-gray-600 hover:text-red-500"><Trash2 size={20} /></button>
          )}
          
          <button title="Note Info" className="text-gray-600 hover:text-blue-500"><Info size={20} /></button>
        </div>
      </div>
      
      {/* Editor Fields */}
      <div className="p-6 flex-grow flex flex-col">
        <input
          type="text"
          value={activeNote.title}
          onChange={(e) => onEditField('title', e.target.value)}
          className="text-3xl font-bold p-2 focus:outline-none mb-4 bg-transparent disabled:bg-gray-100 rounded"
          placeholder="Title"
          autoFocus
          disabled={isTrashed}
        />
        <textarea
          placeholder="Start writing..."
          value={activeNote.body}
          onChange={(e) => onEditField('body', e.target.value)}
          className="flex-grow p-2 text-lg focus:outline-none resize-none bg-transparent disabled:bg-gray-100 rounded"
          disabled={isTrashed}
        />
      </div>
    </div>
  );
};

export default NoteEditor;