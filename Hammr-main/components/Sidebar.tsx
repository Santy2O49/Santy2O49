import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { ADMIN_NAV_LINKS, CONTRACTOR_NAV_LINKS, CONTRACTEE_NAV_LINKS } from '../constants';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const navLinks = useMemo(() => {
    if (!user) return [];
    switch (user.role) {
      case UserRole.Admin:
        return ADMIN_NAV_LINKS;
      case UserRole.Contractor:
        return CONTRACTOR_NAV_LINKS;
      case UserRole.Contractee:
        return CONTRACTEE_NAV_LINKS;
      default:
        return [];
    }
  }, [user]);

  const availableNavLinks = navLinks.filter(link => {
    if (!link.roles) {
      return true;
    }
    return user && link.roles.includes(user.role);
  });

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">HAMMR</h1>
        <span className="text-2xl font-bold text-blue-500">.</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {availableNavLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200 transform hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isActive ? 'bg-blue-500 text-white dark:text-white' : ''
              }`
            }
          >
            {link.icon}
            <span className="ml-4 font-medium">{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
