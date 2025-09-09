import React from 'react';

interface HeaderProps {
  onNewNote: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewNote }) => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">React & Tailwind Notes (TS)</h1>
      <button
        onClick={onNewNote}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
      >
        + Add Note
      </button>
    </header>
  );
};

export default Header;