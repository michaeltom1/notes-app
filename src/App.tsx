import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar, { type Filter } from "./components/Sidebar";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";
import type { Note } from "./types/note";
import type { Category } from "./types/category";

function App() {
  // --- STATE MANAGEMENT ---

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedNotes = localStorage.getItem("notes");
      return savedNotes ? JSON.parse(savedNotes) : [];
    } catch (error) {
      console.error("Failed to parse notes from localStorage", error);
      return [];
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const savedCategories = localStorage.getItem("categories");
      return savedCategories ? JSON.parse(savedCategories) : [];
    } catch (error) {
      console.error("Failed to parse categories from localStorage", error);
      return [];
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("Notes");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // --- EFFECTS ---

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // --- DERIVED STATE & LOGIC ---

  const filteredNotes = useMemo(() => {
    let notesToFilter: Note[];

    switch (activeFilter) {
      case "Favorites":
        notesToFilter = notes.filter((note) => note.favorited && !note.trashed);
        break;
      case "Trash":
        notesToFilter = notes.filter((note) => note.trashed);
        break;
      case "Notes":
      default:
        notesToFilter = notes.filter((note) => !note.trashed);
        break;
    }

    if (activeCategoryId) {
      return notesToFilter.filter(
        (note) => note.categoryId === activeCategoryId
      );
    }

    return notesToFilter;
  }, [notes, activeFilter, activeCategoryId]);

  useEffect(() => {
    const activeNoteIsVisible = filteredNotes.some(
      (note) => note.id === activeNoteId
    );
    if (!activeNoteIsVisible) {
      setActiveNoteId(filteredNotes.length > 0 ? filteredNotes[0].id : null);
    }
  }, [filteredNotes, activeNoteId]);

  // --- HANDLER FUNCTIONS ---

  const handleNewNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: "New Note",
      body: "",
      lastModified: Date.now(),
      favorited: false,
      trashed: false,
      categoryId: activeCategoryId,
    };
    setNotes([newNote, ...notes]);
    setActiveFilter("Notes");
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(
      notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  };

  const handleNewCategory = () => {
    const categoryName = prompt("Enter new category name:");
    if (categoryName && categoryName.trim() !== "") {
      const newCategory: Category = { id: uuidv4(), name: categoryName.trim() };
      setCategories([...categories, newCategory]);
      setActiveCategoryId(newCategory.id);
      setActiveFilter("Notes");
    }
  };

  const handleSelectFilter = (filter: Filter) => {
    setActiveFilter(filter);
    setActiveCategoryId(null);
  };

  const handleSelectCategory = (categoryId: string | null) => {
    setActiveCategoryId(categoryId);
    setActiveFilter("Notes");
  };

  const handleAssignCategory = (noteId: string, categoryId: string | null) => {
    setNotes(
      notes.map((note) =>
        note.id === noteId
          ? { ...note, categoryId, lastModified: Date.now() }
          : note
      )
    );
  };

  const handleToggleFavorite = (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      setNotes(
        notes.map((n) => (n.id === id ? { ...n, favorited: !n.favorited } : n))
      );
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, trashed: true } : n)));
  };

  const handleRestoreNote = (id: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, trashed: false } : n)));
  };

  const handleEmptyTrash = () => {
    const trashedCount = notes.filter((note) => note.trashed).length;
    if (trashedCount === 0) return alert("The trash is already empty.");
    if (
      window.confirm(
        `Are you sure you want to permanently delete ${trashedCount} note(s)?`
      )
    ) {
      setNotes(notes.filter((note) => !note.trashed));
    }
  };

  const handlePermanentlyDeleteNote = (id: string) => {
    if (
      window.confirm(`Are you sure you want to permanently delete this note?`)
    ) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  const handleRenameCategory = (categoryId: string, newName: string) => {
    if (newName && newName.trim() !== "") {
      setCategories(
        categories.map((category) =>
          category.id === categoryId
            ? { ...category, name: newName.trim() }
            : category
        )
      );
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find((c) => c.id === categoryId);
    if (!categoryToDelete) return;

    if (
      window.confirm(
        `Are you sure you want to delete the category "${categoryToDelete.name}"? Notes in this category will become uncategorized.`
      )
    ) {
      setNotes(
        notes.map((note) =>
          note.categoryId === categoryId ? { ...note, categoryId: null } : note
        )
      );
      setCategories(
        categories.filter((category) => category.id !== categoryId)
      );
      if (activeCategoryId === categoryId) {
        setActiveCategoryId(null);
      }
    }
  };

  const activeNote = notes.find((note) => note.id === activeNoteId);

  return (
    <div className="App bg-gray-50 min-h-screen flex text-gray-900 overflow-hidden">
      <Sidebar
        activeFilter={activeFilter}
        onSelectFilter={handleSelectFilter}
        categories={categories}
        onNewCategory={handleNewCategory}
        activeCategoryId={activeCategoryId}
        onSelectCategory={handleSelectCategory}
        onAssignCategory={handleAssignCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        initialWidth={256}
        minWidth={200}
        maxWidth={400}
      />
      <main className="flex flex-grow">
        <NoteList
          notes={filteredNotes}
          onSelectNote={setActiveNoteId}
          onNewNote={handleNewNote}
          activeNoteId={activeNoteId}
          activeCategory={activeFilter}
          onEmptyTrash={handleEmptyTrash}
          initialWidth={350}
          minWidth={250}
          maxWidth={600}
          categories={categories}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onPermanentlyDelete={handlePermanentlyDeleteNote}
        />
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
