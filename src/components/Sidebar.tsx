import React from 'react';
// Import icons from lucide-react
import { Notebook, Star, Trash2 } from 'lucide-react';

export type Category = 'Notes' | 'Favorites' | 'Trash';

interface SidebarProps {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, setActiveCategory }) => {
  const categories: { name: Category; icon: JSX.Element }[] = [
    { name: 'Notes', icon: <Notebook size={20} /> },
    { name: 'Favorites', icon: <Star size={20} /> },
    { name: 'Trash', icon: <Trash2 size={20} /> },
  ];

  return (
    <nav className="w-64 bg-gray-800 text-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 text-center border-b border-gray-700">
        <h1 className="text-2xl font-bold">Lucide Notes</h1>
      </div>
      <ul className="mt-4">
        {categories.map(({ name, icon }) => (
          <li key={name}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveCategory(name);
              }}
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
    </nav>
  );
};

export default Sidebar;