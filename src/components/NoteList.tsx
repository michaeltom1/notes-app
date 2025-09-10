import React, { useState, useRef, useCallback, useEffect } from "react";
import type { Note } from "../types/note";
// import type { Filter } from "./Sidebar";
// import type { Category } from "../types/category";
import {
  Plus,
  Search,
  Eraser,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  FolderPlus,
  FolderMinus,
  Undo2,
} from "lucide-react";
import { useAppContext } from "../context/AppContext"; // Import the custom hook

// The props interface is now minimal, only for layout/initialization
interface NoteListProps {
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number;
}

// State type for the context menu
type ContextMenu = {
  visible: boolean;
  x: number;
  y: number;
  note: Note;
} | null;

const NoteList: React.FC<NoteListProps> = ({
  initialWidth,
  minWidth = 250,
  maxWidth = 600,
}) => {
  // --- STATE & CONTEXT ---
  // All global state and actions are now pulled from the context
  const {
    filteredNotes: notes, // Rename for local clarity
    activeNoteId,
    activeFilter,
    categories,
    actions,
  } = useAppContext();

  // Internal UI state for this component
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState<string>("");
  const [submenuVisible, setSubmenuVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const submenuTimerRef = useRef<number | null>(null);

  // --- HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isResizing.current = true;
  };
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing.current) {
        setWidth((w) =>
          Math.max(minWidth, Math.min(w + e.movementX, maxWidth))
        );
      }
    },
    [minWidth, maxWidth]
  );
  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
  }, []);
  const handleDragStart = (e: React.DragEvent, noteId: string) =>
    e.dataTransfer.setData("noteId", noteId);

  const handleMenuClick = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    e.preventDefault();
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const buttonRect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: buttonRect.left - containerRect.left,
      y: buttonRect.bottom - containerRect.top,
      note,
    });
  };

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
    setSubmenuVisible(false);
  }, []);

  const handleRenameSubmit = () => {
    if (!editingNoteId) return;
    const noteToUpdate = notes.find((n) => n.id === editingNoteId);
    if (noteToUpdate && editingNoteTitle.trim() !== "") {
      actions.handleUpdateNote({
        ...noteToUpdate,
        title: editingNoteTitle.trim(),
      });
    }
    setEditingNoteId(null);
    setEditingNoteTitle("");
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRenameSubmit();
    else if (e.key === "Escape") {
      setEditingNoteId(null);
      setEditingNoteTitle("");
    }
  };

  const startCloseTimer = () => {
    // Clear any existing timer to reset the delay
    if (submenuTimerRef.current) {
      clearTimeout(submenuTimerRef.current);
    }
    submenuTimerRef.current = setTimeout(() => {
      setSubmenuVisible(false);
    }, 200); // 200ms delay is usually a good value
  };

  const cancelCloseTimer = () => {
    if (submenuTimerRef.current) {
      clearTimeout(submenuTimerRef.current);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    window.addEventListener("click", closeContextMenu);
    return () => window.removeEventListener("click", closeContextMenu);
  }, [closeContextMenu]);

  const sortedNotes = [...notes].sort(
    (a, b) => b.lastModified - a.lastModified
  );

  return (
    <div
      ref={containerRef}
      className="relative flex-shrink-0 bg-gray-100 border-r border-gray-300 flex flex-col"
      style={{ width: `${width}px` }}
    >
      <div className="h-full overflow-hidden flex flex-col">
        {/* Note List Header */}
        <div className="p-4 bg-white border-b border-gray-300 shadow-sm flex-shrink-0">
          {activeFilter === "Trash" ? (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-center">Trash</h2>
              {notes.length > 0 && (
                <button
                  onClick={actions.handleEmptyTrash}
                  className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                >
                  <Eraser className="mr-2" size={16} /> Empty Trash
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="search"
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={actions.handleNewNote}
                className="mt-4 w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                <Plus className="mr-2" size={16} /> New Note
              </button>
            </>
          )}
        </div>

        {/* Notes */}
        <div className="flex-grow overflow-y-auto">
          {sortedNotes.length > 0 ? (
            sortedNotes.map((note) => {
              const noteCategory = note.categoryId
                ? categories.find((c) => c.id === note.categoryId)
                : null;
              const isEditing = editingNoteId === note.id;

              return (
                <div
                  key={note.id}
                  onMouseEnter={() => setHoveredNoteId(note.id)}
                  onMouseLeave={() => setHoveredNoteId(null)}
                  draggable={!note.trashed}
                  onDragStart={(e) => handleDragStart(e, note.id)}
                  className={`relative p-4 border-b border-gray-200 transition-colors duration-200 ${
                    note.trashed
                      ? "opacity-60"
                      : "cursor-pointer hover:bg-sky-100"
                  } ${note.id === activeNoteId ? "bg-sky-200" : ""}`}
                >
                  <div
                    onClick={() =>
                      !isEditing && actions.setActiveNoteId(note.id)
                    }
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingNoteTitle}
                        onChange={(e) => setEditingNoteTitle(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={handleRenameKeyDown}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-lg font-semibold bg-white outline-none border-b-2 border-blue-500 -m-1 p-1"
                      />
                    ) : (
                      <h3 className="font-semibold truncate text-lg mb-1">
                        {note.title || "Untitled Note"}
                      </h3>
                    )}
                    <p className="text-gray-600 truncate text-sm mb-2">
                      {note.body.substring(0, 50) || "No additional text"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {note.favorited && (
                          <div
                            className="flex items-center gap-1 text-yellow-500 flex-shrink-0"
                            title="Favorite"
                          >
                            <Star size={14} fill="currentColor" />
                          </div>
                        )}
                        {noteCategory && (
                          <div
                            className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full"
                            title={`Category: ${noteCategory.name}`}
                          >
                            <span className="truncate max-w-[100px]">
                              {noteCategory.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <small className="flex-shrink-0">
                        {new Date(note.lastModified).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" }
                        )}
                      </small>
                    </div>
                  </div>
                  {hoveredNoteId === note.id && !isEditing && (
                    <button
                      onClick={(e) => handleMenuClick(e, note)}
                      className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-300"
                    >
                      <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              {activeFilter === "Trash"
                ? "Trash is empty."
                : "No notes in this category."}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute z-10 bg-white shadow-lg rounded-md py-1 w-52 border border-gray-200 animate-fade-in-fast"
          onClick={(e) => e.stopPropagation()}
          // onMouseLeave={() => setSubmenuVisible(false)}
          onMouseLeave={startCloseTimer}
        >
          {contextMenu.note.trashed ? (
            <>
              <button
                onClick={() => {
                  actions.handleRestoreNote(contextMenu.note.id);
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                <Undo2 size={14} className="mr-3" /> Restore
              </button>
              <div className="border-t my-1 border-gray-100"></div>
              <button
                onClick={() => {
                  actions.handlePermanentlyDeleteNote(contextMenu.note.id);
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
              >
                <Trash2 size={14} className="mr-3" /> Delete Permanently
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditingNoteId(contextMenu.note.id);
                  setEditingNoteTitle(contextMenu.note.title);
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                <Edit size={14} className="mr-3" /> Rename
              </button>
              <button
                onClick={() => {
                  actions.handleToggleFavorite(contextMenu.note.id);
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                <Star size={14} className="mr-3" />{" "}
                {contextMenu.note.favorited ? "Unfavorite" : "Mark as Favorite"}
              </button>
              <div className="border-t my-1 border-gray-100"></div>
              {contextMenu.note.categoryId ? (
                <button
                  onClick={() => {
                    actions.handleAssignCategory(contextMenu.note.id, null);
                    closeContextMenu();
                  }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                >
                  <FolderMinus size={14} className="mr-3" /> Remove from
                  Category
                </button>
              ) : (
                <div
                  className="relative"
                  onMouseEnter={() => {
                    cancelCloseTimer();
                    setSubmenuVisible(true);
                  }}
                >
                  <div className="flex items-center justify-between text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-default">
                    <div className="flex items-center">
                      <FolderPlus size={14} className="mr-3" /> Move to Category
                    </div>
                    <span className="text-xs text-gray-400">&#9656;</span>
                  </div>
                  {submenuVisible && (
                    <div className="absolute left-full -top-1 ml-2 bg-white shadow-lg rounded-md py-1 w-48 border border-gray-200 animate-fade-in-fast">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              actions.handleAssignCategory(
                                contextMenu.note.id,
                                category.id
                              );
                              closeContextMenu();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                          >
                            {category.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-400">
                          No categories available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="border-t my-1 border-gray-100"></div>
              <button
                onClick={() => {
                  actions.handleDeleteNote(contextMenu.note.id);
                  closeContextMenu();
                }}
                className="w-full text-left px-3 py-2 text-sm flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
              >
                <Trash2 size={14} className="mr-3" /> Move to Trash
              </button>
            </>
          )}
        </div>
      )}

      {/* Resize Handle */}
      <div
        role="separator"
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 h-full w-0.5 cursor-col-resize bg-gray-300 hover:bg-blue-500 transition-colors duration-200"
      />
    </div>
  );
};

export default NoteList;
