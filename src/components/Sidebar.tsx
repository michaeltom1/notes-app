import React, { useState, useRef, useCallback, useEffect, type JSX } from 'react';
import { Notebook, Star, Trash2, Folder, Plus, Edit, XCircle, MoreVertical } from 'lucide-react';
import type { Category } from '../types/category';

// Defines the main, non-user-created filters
export type Filter = 'Notes' | 'Favorites' | 'Trash';

// Type for our custom context menu's state
type ContextMenu = {
  visible: boolean;
  x: number;
  y: number;
  categoryId: string;
} | null;

// The complete set of props the Sidebar component now accepts
interface SidebarProps {
  activeFilter: Filter;
  onSelectFilter: (filter: Filter) => void;
  categories: Category[];
  onNewCategory: () => void;
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onAssignCategory: (noteId: string, categoryId: string | null) => void; // For drag-drop
  onRenameCategory: (categoryId: string, newName: string) => void;       // For context menu
  onDeleteCategory: (categoryId: string) => void;       // For context menu
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeFilter,
  onSelectFilter,
  categories,
  onNewCategory,
  activeCategoryId,
  onSelectCategory,
  onAssignCategory,
  onRenameCategory,
  onDeleteCategory,
  initialWidth,
  minWidth = 200,
  maxWidth = 400,
}) => {
  // --- RESIZING LOGIC ---
  const [width, setWidth] = useState(initialWidth);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isResizing.current = true;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      setWidth((prevWidth) => Math.max(minWidth, Math.min(prevWidth + e.movementX, maxWidth)));
    }
  }, [minWidth, maxWidth]);

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
  // --- END RESIZING LOGIC ---

  // --- NEW STATE for Context Menu and Drag-Drop ---
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null); // New state for hover
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>("");

  // --- CONTEXT MENU HANDLERS ---
 const handleMenuClick = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation(); // Prevent the click from closing the menu instantly
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      visible: true,
      x: rect.left,
      y: rect.bottom, // Position menu below the 3-dot icon
      categoryId,
    });
  };

  const closeContextMenu = useCallback(() => setContextMenu(null), []);
  useEffect(() => {
    // Add a global click listener to close the context menu
    window.addEventListener('click', closeContextMenu);
    return () => window.removeEventListener('click', closeContextMenu);
  }, [closeContextMenu]);
  
  // --- DRAG-DROP HANDLERS ---
  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDropTargetId(categoryId);
  };
  const handleDragLeave = () => setDropTargetId(null);
  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("noteId");
    if (noteId) {
      onAssignCategory(noteId, categoryId);
    }
    setDropTargetId(null);
  };

  const handleRenameSubmit = () => {
    if (editingCategoryId && editingCategoryName.trim() !== "") {
      onRenameCategory(editingCategoryId, editingCategoryName);
    }
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setEditingCategoryId(null);
      setEditingCategoryName("");
    }
  };
  
  const filters: { name: Filter; icon: JSX.Element }[] = [
    { name: 'Notes', icon: <Notebook size={20} /> },
    { name: 'Favorites', icon: <Star size={20} /> },
    { name: 'Trash', icon: <Trash2 size={20} /> },
  ];

  return (
    <nav
      className="relative flex-shrink-0 bg-gray-800 text-gray-200 flex flex-col"
      style={{ width: `${width}px` }}
    >
      <div className="h-full overflow-hidden flex flex-col">
        <div className="p-4 text-center border-b border-gray-700">
          <h1 className="text-2xl font-bold">Lucide Notes</h1>
        </div>
        
        {/* Main Filters */}
        <ul className="mt-4">
          {filters.map(({ name, icon }) => (
            <li key={name}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onSelectFilter(name); }}
                className={`flex items-center px-6 py-3 text-lg hover:bg-gray-700 transition-colors duration-200 ${
                  activeFilter === name && !activeCategoryId ? 'bg-blue-600 text-white' : ''
                }`}
              >
                <span className="mr-4">{icon}</span>{name}
              </a>
            </li>
          ))}
        </ul>

        {/* Categories Section */}
        <div className="mt-6 px-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Categories</h2>
            <button onClick={onNewCategory} title="New Category" className="text-gray-400 hover:text-white transition-colors duration-200">
              <Plus size={20} />
            </button>
          </div>
        </div>
        <ul className="flex-grow overflow-y-auto">
          {categories.map((category) => (
            <li 
              key={category.id}
              onMouseEnter={() => setHoveredCategoryId(category.id)}
              onMouseLeave={() => setHoveredCategoryId(null)}
            >
              <a
                href="#"
                onClick={(e) => { 
                  if (editingCategoryId !== category.id) {
                    e.preventDefault(); 
                    onSelectCategory(category.id);
                  }
                }}
                onDragOver={(e) => handleDragOver(e, category.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, category.id)}
                className={`flex items-center justify-between px-6 py-2 text-md hover:bg-gray-700 rounded-r-full mr-2 transition-colors duration-200 ${
                  activeCategoryId === category.id && !editingCategoryId ? 'bg-gray-600 text-white' : ''
                } ${
                  dropTargetId === category.id ? 'bg-blue-800' : ''
                }`}
              >
                <div className="flex items-center truncate w-full">
                  <Folder size={16} className="mr-3 flex-shrink-0" />
                  {editingCategoryId === category.id ? (
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={handleRenameKeyDown}
                      autoFocus
                      className="bg-transparent text-white outline-none border-b border-gray-500 w-full"
                    />
                  ) : (
                    <span className="truncate">{category.name}</span>
                  )}
                </div>

                {hoveredCategoryId === category.id && !editingCategoryId && (
                  <button 
                    onClick={(e) => handleMenuClick(e, category.id)}
                    className="p-1 rounded-full hover:bg-gray-500"
                  >
                    <MoreVertical size={16} />
                  </button>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* RENDER THE CONTEXT MENU */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute z-10 bg-white shadow-lg rounded-md py-1 w-40 border border-gray-200"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside menu from closing it
        >
          <button
            onClick={() => {
              const currentCategory = categories.find(c => c.id === contextMenu.categoryId);
              if (currentCategory) {
                setEditingCategoryId(currentCategory.id);
                setEditingCategoryName(currentCategory.name);
              }
              closeContextMenu(); // Close menu to begin editing
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Edit size={14} className="mr-2" /> Rename
          </button>
          <button
            // --- FIXED: reliable onClick event ---
            onClick={() => {
              onDeleteCategory(contextMenu.categoryId);
              closeContextMenu(); // Close menu after action
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <XCircle size={14} className="mr-2" /> Delete
          </button>
        </div>
      )}
      
      {/* Resize Handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        className="absolute top-0 right-0 h-full w-0.5 cursor-col-resize bg-gray-600 hover:bg-blue-500 transition-colors duration-200 opacity-50 hover:opacity-100"
        onMouseDown={handleMouseDown}
      />
    </nav>
  );
};

export default Sidebar;