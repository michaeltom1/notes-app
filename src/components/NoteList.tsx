import React from 'react';
import type { Note } from '../types/note';
import { Plus, Search } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  activeNoteId: string | null;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onSelectNote, onNewNote, activeNoteId }) => {
  const sortedNotes = [...notes].sort((a, b) => b.lastModified - a.lastModified);

  return (
    <div className="w-1/3 bg-gray-100 border-r border-gray-300 flex flex-col">
      {/* Note List Header */}
      <div className="p-4 bg-white border-b border-gray-300 shadow-sm flex-shrink-0">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="search"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onNewNote}
          className="mt-4 w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          <Plus className="mr-2" size={16} /> New Note
        </button>
      </div>

      {/* Notes */}
      <div className="h-full overflow-y-auto">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-sky-100 transition-colors duration-200 ${
                note.id === activeNoteId ? 'bg-sky-200' : ''
              }`}
              onClick={() => onSelectNote(note.id)}
            >
              <h3 className="font-semibold truncate text-lg">{note.title || 'Untitled Note'}</h3>
              <p className="text-gray-600 truncate text-sm">
                {note.body.substring(0, 50) || 'No additional text'}
              </p>
              <small className="text-gray-400 mt-2 block">
                {new Date(note.lastModified).toLocaleDateString("en-GB", {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </small>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            No notes in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteList;