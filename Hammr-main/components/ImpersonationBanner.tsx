import React from 'react';
import { User } from '../types';
import Button from './ui/Button';

interface ImpersonationBannerProps {
  user: User;
  onStop: () => void;
}

const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ user, onStop }) => {
  return (
    <div className="bg-yellow-400 dark:bg-yellow-600 text-black dark:text-white p-2 text-center text-sm font-semibold flex items-center justify-center z-50">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
      <span>
        You are currently viewing as <strong>{user.fullName}</strong>.
      </span>
      <button onClick={onStop} className="ml-4 text-xs font-bold uppercase hover:underline">
        Return to Admin View
      </button>
    </div>
  );
};

export default ImpersonationBanner;
