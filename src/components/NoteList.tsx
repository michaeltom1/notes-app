import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { Note } from '../types/note';
import type { Category } from './Sidebar';
import { Plus, Search, Eraser } from 'lucide-react';

// Add maxWidth to the component's props interface
interface NoteListProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  activeNoteId: string | null;
  activeCategory: Category;
  onEmptyTrash: () => void;
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number; // New optional prop
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  onSelectNote,
  onNewNote,
  activeNoteId,
  activeCategory,
  onEmptyTrash,
  initialWidth,
  minWidth = 250,
  maxWidth = 600, // Set a default max width
}) => {
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isResizing.current = true;
  };

  // Update the mouse move handler to respect the maxWidth
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      setWidth((prevWidth) => {
        const newWidth = prevWidth + e.movementX;
        // Clamp the new width between the min and max values
        return Math.max(minWidth, Math.min(newWidth, maxWidth));
      });
    }
  }, [minWidth, maxWidth]); // Add maxWidth to the dependency array

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
  }, []);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const sortedNotes = [...notes].sort((a, b) => b.lastModified - a.lastModified);

  return (
    <div
      className="relative flex-shrink-0 bg-gray-100 border-r border-gray-300 flex flex-col"
      style={{ width: `${width}px` }}
    >
      <div className="h-full overflow-hidden flex flex-col">
        {/* Note List Header - (No changes here) */}
        <div className="p-4 bg-white border-b border-gray-300 shadow-sm flex-shrink-0">
          {activeCategory === 'Trash' ? (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">Trash</h2>
              <button
                onClick={onEmptyTrash}
                className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                <Eraser className="mr-2" size={16} /> Empty Trash
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Notes list - (No changes here) */}
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
              {activeCategory === 'Trash' ? 'Trash is empty.' : 'No notes in this category.'}
            </div>
          )}
        </div>
      </div>
      
      <div
        role="separator"
        aria-orientation="vertical"
        className="absolute top-0 right-0 h-full w-2 cursor-col-resize bg-gray-300 hover:bg-blue-500 transition-colors duration-200"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export default NoteList;