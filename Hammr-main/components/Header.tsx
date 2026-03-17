import React from 'react';
import { User } from '../types';

interface HeaderProps {
  onLogout: () => void;
  user: User | null;
  isImpersonating: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, isImpersonating }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
      <div className="flex items-center">
        {/* Can add a search bar or other elements here later */}
      </div>
      <div className="flex items-center">
        <span className="mr-4 font-medium">{user?.fullName ?? 'User'}</span>
        {!isImpersonating && (
            <button
            onClick={onLogout}
            className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
