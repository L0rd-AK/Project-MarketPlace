import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const roleConfig = {
    ADMIN: {
      color: 'yellow',
      bgGradient: 'from-yellow-50 to-amber-50',
      navLinks: [
        { to: '/admin', label: 'Dashboard' },
      ],
    },
    BUYER: {
      color: 'blue',
      bgGradient: 'from-blue-50 to-indigo-50',
      navLinks: [
        { to: '/buyer', label: 'Dashboard' },
      ],
    },
    SOLVER: {
      color: 'green',
      bgGradient: 'from-green-50 to-emerald-50',
      navLinks: [
        { to: '/solver', label: 'Dashboard' },
      ],
    },
  };

  const config = roleConfig[role];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient}`}>
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to={`/${role.toLowerCase()}`}>
                <h1 className="text-2xl font-bold text-gray-900">Project Marketplace</h1>
              </Link>
              <nav className="flex gap-4">
                {config.navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      location.pathname === link.to
                        ? `bg-${config.color}-100 text-${config.color}-700`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-${config.color}-100 text-${config.color}-800`}
                  >
                    {role}
                  </span>
                </p>
              </div>
              <button
                onClick={() => logout()}
                className="btn btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 text-center text-sm text-gray-500">
        <p>© 2026 Project Marketplace. Built with MERN stack.</p>
      </footer>
    </div>
  );
}
