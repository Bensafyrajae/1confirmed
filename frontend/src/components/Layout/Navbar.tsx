import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  Menu as MenuIcon, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/UI/Button';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const userInitials = user 
    ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-secondary-200">
      {/* Mobile menu button */}
      <button
        type="button"
        className="px-4 border-r border-secondary-200 text-secondary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <MenuIcon className="h-6 w-6" />
      </button>

      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Search bar - can be added later */}
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            {/* Future search functionality */}
          </div>
        </div>

        {/* Right side buttons */}
        <div className="ml-4 flex items-center md:ml-6">
          {/* Notifications */}
          <button
            type="button"
            className="bg-white p-1 rounded-full text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
          </button>

          {/* Profile dropdown */}
          <Menu as="div" className="ml-3 relative">
            <div>
              <Menu.Button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="sr-only">Open user menu</span>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {userInitials}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-base font-medium text-secondary-800">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm font-medium text-secondary-500">
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-secondary-400" />
                </div>
              </Menu.Button>
            </div>
            
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/profile"
                      className={clsx(
                        active ? 'bg-secondary-100' : '',
                        'block px-4 py-2 text-sm text-secondary-700 flex items-center'
                      )}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Votre profil
                    </a>
                  )}
                </Menu.Item>
                
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/settings"
                      className={clsx(
                        active ? 'bg-secondary-100' : '',
                        'block px-4 py-2 text-sm text-secondary-700 flex items-center'
                      )}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Paramètres
                    </a>
                  )}
                </Menu.Item>
                
                <div className="border-t border-secondary-100">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={clsx(
                          active ? 'bg-secondary-100' : '',
                          'block w-full text-left px-4 py-2 text-sm text-secondary-700 flex items-center'
                        )}
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Se déconnecter
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export { Navbar };
export default Navbar;