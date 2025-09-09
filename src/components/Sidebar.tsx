import React, { useState, useRef, useCallback, useEffect, type JSX } from 'react';
import { Notebook, Star, Trash2 } from 'lucide-react';

export type Category = 'Notes' | 'Favorites' | 'Trash';

// Add maxWidth to the component's props interface
interface SidebarProps {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
  initialWidth: number;
  minWidth?: number;
  maxWidth?: number; // New optional prop
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeCategory, 
  setActiveCategory,
  initialWidth,
  minWidth = 200,
  maxWidth = 400, // Set a default max width
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

  const categories: { name: Category; icon: JSX.Element }[] = [
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
        <ul className="mt-4">
          {categories.map(({ name, icon }) => (
            <li key={name}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveCategory(name); }}
                className={`flex items-center px-6 py-3 text-lg hover:bg-gray-700 transition-colors duration-200 ${
                  activeCategory === name ? 'bg-blue-600 text-white' : ''
                }`}
              >
                <span className="mr-4">{icon}</span>
                {name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        className="absolute top-0 right-0 h-full w-2 cursor-col-resize bg-gray-600 hover:bg-blue-500 transition-colors duration-200 opacity-50 hover:opacity-100"
        onMouseDown={handleMouseDown}
      />
    </nav>
  );
};

export default Sidebar;