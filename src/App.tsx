import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar,{ type Category } from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import type { Note } from './types/note';

function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('Notes');

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  // Derived state to filter notes based on the active category
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
  
  // Update activeNoteId if the current active note is no longer in the filtered list
  useEffect(() => {
    const activeNoteIsVisible = filteredNotes.some(note => note.id === activeNoteId);
    if (!activeNoteIsVisible) {
      setActiveNoteId(filteredNotes.length > 0 ? filteredNotes[0].id : null);
    }
  }, [filteredNotes, activeNoteId]);

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
    setActiveCategory('Notes');
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

  const activeNote = notes.find((note) => note.id === activeNoteId);

  return (
    <div className="App bg-gray-50 min-h-screen flex text-gray-900">
      <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <main className="flex flex-grow">
        <NoteList
          notes={filteredNotes}
          onSelectNote={setActiveNoteId}
          onNewNote={handleNewNote}
          activeNoteId={activeNoteId}
        />
        <NoteEditor
          activeNote={activeNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onRestoreNote={handleRestoreNote}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>
    </div>
  );
}

export default App;