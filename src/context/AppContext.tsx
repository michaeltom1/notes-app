import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import type { Note } from "../types/note";
import type { Category } from "../types/category";
import type { Filter } from "../components/Sidebar";

// 1. Define the shape of the data and functions the context will provide.
interface AppContextState {
  notes: Note[];
  categories: Category[];
  activeNoteId: string | null;
  activeFilter: Filter;
  activeCategoryId: string | null;
  filteredNotes: Note[];
  activeNote: Note | undefined;
  actions: {
    handleNewNote: () => void;
    handleUpdateNote: (updatedNote: Note) => void;
    handleNewCategory: () => void;
    handleSelectFilter: (filter: Filter) => void;
    handleSelectCategory: (categoryId: string | null) => void;
    handleAssignCategory: (noteId: string, categoryId: string | null) => void;
    handleToggleFavorite: (id: string) => void;
    handleDeleteNote: (id: string) => void;
    handleRestoreNote: (id: string) => void;
    handleEmptyTrash: () => void;
    handlePermanentlyDeleteNote: (id: string) => void;
    handleRenameCategory: (categoryId: string, newName: string) => void;
    handleDeleteCategory: (categoryId: string) => void;
    setActiveNoteId: React.Dispatch<React.SetStateAction<string | null>>;
  };
}

// 2. Create the context. It's initially undefined.
const AppContext = createContext<AppContextState | undefined>(undefined);

// 3. Create the Provider component. This will wrap the entire application.
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // --- All state logic is moved here from App.tsx ---
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedNotes = localStorage.getItem("notes");
      return savedNotes ? JSON.parse(savedNotes) : [];
    } catch (error) {
      return [];
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const savedCategories = localStorage.getItem("categories");
      return savedCategories ? JSON.parse(savedCategories) : [];
    } catch (error) {
      return [];
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>("Notes");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // --- All effects are moved here ---
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // --- All derived state is moved here ---
  const filteredNotes = useMemo(() => {
    let notesToFilter: Note[];
    switch (activeFilter) {
      case "Favorites":
        notesToFilter = notes.filter((n) => n.favorited && !n.trashed);
        break;
      case "Trash":
        notesToFilter = notes.filter((n) => n.trashed);
        break;
      default:
        notesToFilter = notes.filter((n) => !n.trashed);
        break;
    }
    return activeCategoryId
      ? notesToFilter.filter((n) => n.categoryId === activeCategoryId)
      : notesToFilter;
  }, [notes, activeFilter, activeCategoryId]);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeNoteId),
    [notes, activeNoteId]
  );

  useEffect(() => {
    if (!filteredNotes.some((note) => note.id === activeNoteId)) {
      setActiveNoteId(filteredNotes.length > 0 ? filteredNotes[0].id : null);
    }
  }, [filteredNotes, activeNoteId]);

  // --- All handler functions are moved and grouped into an 'actions' object ---
  const actions = {
    handleNewNote: () => {
      const mostRecentNote = [...notes].sort(
        (a, b) => b.lastModified - a.lastModified
      )[0];

      if (
        mostRecentNote &&
        mostRecentNote.title === "New Note" &&
        mostRecentNote.body.trim() === "" &&
        !mostRecentNote.trashed
      ) {
        setActiveNoteId(mostRecentNote.id);
        setActiveFilter("Notes");
        return;
      }

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
    },
    handleUpdateNote: (updatedNote: Note) =>
      setNotes(notes.map((n) => (n.id === updatedNote.id ? updatedNote : n))),
    handleNewCategory: () => {
      const name = prompt("Enter new category name:");
      if (name?.trim()) {
        const newCategory: Category = { id: uuidv4(), name: name.trim() };
        setCategories([...categories, newCategory]);
        setActiveCategoryId(newCategory.id);
        setActiveFilter("Notes");
      }
    },
    handleSelectFilter: (filter: Filter) => {
      setActiveFilter(filter);
      setActiveCategoryId(null);
    },
    handleSelectCategory: (categoryId: string | null) => {
      setActiveCategoryId(categoryId);
      setActiveFilter("Notes");
    },
    handleAssignCategory: (noteId: string, categoryId: string | null) =>
      setNotes(
        notes.map((n) =>
          n.id === noteId ? { ...n, categoryId, lastModified: Date.now() } : n
        )
      ),
    handleToggleFavorite: (id: string) =>
      setNotes(
        notes.map((n) => (n.id === id ? { ...n, favorited: !n.favorited } : n))
      ),
    handleDeleteNote: (id: string) =>
      setNotes(notes.map((n) => (n.id === id ? { ...n, trashed: true } : n))),
    handleRestoreNote: (id: string) =>
      setNotes(notes.map((n) => (n.id === id ? { ...n, trashed: false } : n))),
    handleEmptyTrash: () => {
      if (
        window.confirm(
          `Are you sure you want to permanently delete all notes in the trash?`
        )
      ) {
        setNotes(notes.filter((n) => !n.trashed));
      }
    },
    handlePermanentlyDeleteNote: (id: string) => {
      if (
        window.confirm(`Are you sure you want to permanently delete this note?`)
      ) {
        setNotes(notes.filter((n) => n.id !== id));
      }
    },
    handleRenameCategory: (categoryId: string, newName: string) => {
      setCategories(
        categories.map((c) =>
          c.id === categoryId ? { ...c, name: newName.trim() } : c
        )
      );
    },
    handleDeleteCategory: (categoryId: string) => {
      const cat = categories.find((c) => c.id === categoryId);
      if (
        cat &&
        window.confirm(
          `Delete category "${cat.name}"? Notes will become uncategorized.`
        )
      ) {
        setNotes(
          notes.map((n) =>
            n.categoryId === categoryId ? { ...n, categoryId: null } : n
          )
        );
        setCategories(categories.filter((c) => c.id !== categoryId));
        if (activeCategoryId === categoryId) setActiveCategoryId(null);
      }
    },
    setActiveNoteId,
  };

  const value = {
    notes,
    categories,
    activeNoteId,
    activeFilter,
    activeCategoryId,
    filteredNotes,
    activeNote,
    actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 4. Create a custom hook for easy consumption by child components.
export const useAppContext = (): AppContextState => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
