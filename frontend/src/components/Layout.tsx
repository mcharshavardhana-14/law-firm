import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Folder,
  FileText,
  Users,
  Settings,
  LogOut,
  Scale,
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Case Types', href: '/case-types', icon: Scale },
    { name: 'Projects', href: '/projects', icon: Folder },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <Scale className="h-8 w-8 text-primary-500" />
          <span className="ml-2 text-xl font-bold">Legal CMS</span>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.firstName.charAt(0)}
                {user?.lastName.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
