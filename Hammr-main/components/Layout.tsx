import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { User } from '../types';
import ImpersonationBanner from './ImpersonationBanner';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { activeUser, logout, impersonatedUser, stopImpersonating } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar user={activeUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {impersonatedUser && <ImpersonationBanner user={impersonatedUser} onStop={stopImpersonating} />}
        <Header user={activeUser} onLogout={logout} isImpersonating={!!impersonatedUser} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
