import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar, {type Category } from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import type { Note } from './types/note';

function App() {
  // State for all notes, initialized from localStorage
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedNotes = localStorage.getItem('notes');
      return savedNotes ? JSON.parse(savedNotes) : [];
    } catch (error) {
      console.error("Failed to parse notes from localStorage", error);
      return [];
    }
  });

  // State for the currently selected note ID
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  
  // State for the currently selected category (e.g., 'Notes', 'Trash')
  const [activeCategory, setActiveCategory] = useState<Category>('Notes');

  // Effect to save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Derived state: Filter notes based on the active category using useMemo for performance
  const filteredNotes = useMemo(() => {
    switch (activeCategory) {
      case 'Favorites':
        return notes.filter((note) => note.favorited && !note.trashed);
      case 'Trash':
        return notes.filter((note) => note.trashed);
      case 'Notes':
      default:
        return notes.filter((note) => !note.trashed);
    }
  }, [notes, activeCategory]);
  
  // Effect to adjust the active note if it's no longer visible in the current filtered list
  useEffect(() => {
    const activeNoteIsVisible = filteredNotes.some(note => note.id === activeNoteId);
    if (!activeNoteIsVisible) {
      // If the active note disappears, select the first note in the new list, or null if empty
      setActiveNoteId(filteredNotes.length > 0 ? filteredNotes[0].id : null);
    }
  }, [filteredNotes, activeNoteId]);

  // --- HANDLER FUNCTIONS ---

  const handleNewNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'New Note',
      body: '',
      lastModified: Date.now(),
      favorited: false,
      trashed: false,
    };
    setNotes([newNote, ...notes]);
    setActiveCategory('Notes'); // Switch to the 'Notes' view to see the new note
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    const updatedNotesArray = notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotesArray);
  };

  const setNoteProperty = (id: string, property: keyof Note, value: boolean) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, [property]: value, lastModified: Date.now() } : note
    ));
  };

  const handleToggleFavorite = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setNoteProperty(id, 'favorited', !note.favorited);
    }
  };

  const handleDeleteNote = (id: string) => setNoteProperty(id, 'trashed', true);
  const handleRestoreNote = (id: string) => setNoteProperty(id, 'trashed', false);

  const handleEmptyTrash = () => {
    const trashedCount = notes.filter(note => note.trashed).length;
    if (trashedCount === 0) {
      alert("The trash is already empty.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to permanently delete ${trashedCount} note(s)? This action cannot be undone.`)) {
      setNotes(notes.filter(note => !note.trashed));
    }
  };

  const handlePermanentlyDeleteNote = (id: string) => {
    const noteToDelete = notes.find(note => note.id === id);
    const noteTitle = noteToDelete ? `"${noteToDelete.title}"` : "this note";

    if (window.confirm(`Are you sure you want to permanently delete ${noteTitle}? This action cannot be undone.`)) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  // Derived state: Get the full object for the currently active note
  const activeNote = notes.find((note) => note.id === activeNoteId);

  return (
    <div className="App bg-gray-50 min-h-screen flex text-gray-900 overflow-hidden">
      {/* Resizable Sidebar Panel */}
       <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        initialWidth={256}
        minWidth={200}
      />
      
      <main className="flex flex-grow">
        {/* Resizable Note List Panel */}
        <NoteList
          notes={filteredNotes}
          onSelectNote={setActiveNoteId}
          onNewNote={handleNewNote}
          activeNoteId={activeNoteId}
          activeCategory={activeCategory}
          onEmptyTrash={handleEmptyTrash}
          initialWidth={350}
          minWidth={250}
        />
        
        {/* Note Editor fills the remaining space automatically */}
        <NoteEditor
          activeNote={activeNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onRestoreNote={handleRestoreNote}
          onToggleFavorite={handleToggleFavorite}
          onPermanentlyDelete={handlePermanentlyDeleteNote}
        />
      </main>
    </div>
  );
}

export default App;
// App.tsx full version with latest changes