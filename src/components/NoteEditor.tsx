import React from 'react';
import type { Note } from '../types/note';
// Import icons from lucide-react
import { Star, Trash2, Undo2, Info } from 'lucide-react';

interface NoteEditorProps {
  activeNote: Note | undefined;
  onUpdateNote: (updatedNote: Note) => void;
  onDeleteNote: (id: string) => void; // Moves to trash
  onRestoreNote: (id: string) => void; // Restores from trash
  onToggleFavorite: (id: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ activeNote, onUpdateNote, onDeleteNote, onRestoreNote, onToggleFavorite }) => {
  if (!activeNote) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white text-gray-400 text-2xl">
        Select a note to view or create a new one.
      </div>
    );
  }

  const onEditField = (key: 'title' | 'body', value: string) => {
    onUpdateNote({
      ...activeNote,
      [key]: value,
      lastModified: Date.now(),
    });
  };

  const isTrashed = activeNote.trashed;

  return (
    <div className="flex-grow flex flex-col bg-white">
      {/* Editor Toolbar */}
      <div className="p-3 border-b border-gray-300 flex items-center justify-end space-x-4 bg-gray-50 flex-shrink-0">
        <button
          onClick={() => onToggleFavorite(activeNote.id)}
          title={activeNote.favorited ? "Unfavorite" : "Favorite"}
          className="text-gray-600 hover:text-yellow-500 transition-colors duration-200"
        >
          <Star
            size={20}
            className={activeNote.favorited ? 'text-yellow-500' : ''}
            fill={activeNote.favorited ? 'currentColor' : 'none'}
          />
        </button>
        
        {isTrashed ? (
          <button onClick={() => onRestoreNote(activeNote.id)} title="Restore" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
            <Undo2 size={20} />
          </button>
        ) : (
          <button onClick={() => onDeleteNote(activeNote.id)} title="Move to Trash" className="text-gray-600 hover:text-red-500 transition-colors duration-200">
            <Trash2 size={20} />
          </button>
        )}
        
        <button title="Note Info" className="text-gray-600 hover:text-blue-500 transition-colors duration-200">
          <Info size={20} />
        </button>
      </div>

      {/* Editor Fields */}
      <div className="p-6 flex-grow flex flex-col">
        <input
          type="text"
          id="title"
          value={activeNote.title}
          onChange={(e) => onEditField('title', e.target.value)}
          className="text-3xl font-bold p-2 focus:outline-none mb-4 bg-transparent disabled:bg-gray-100"
          placeholder="Title"
          autoFocus
          disabled={isTrashed}
        />
        <textarea
          id="body"
          placeholder="Start writing..."
          value={activeNote.body}
          onChange={(e) => onEditField('body', e.target.value)}
          className="flex-grow p-2 text-lg focus:outline-none resize-none bg-transparent disabled:bg-gray-100"
          disabled={isTrashed}
        />
      </div>
    </div>
  );
};

export default NoteEditor;