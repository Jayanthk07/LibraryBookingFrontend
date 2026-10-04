import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Library, LogOut, BookOpen, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <Library className="h-8 w-8 text-blue-600" />
              <span className="ml-2 font-bold text-xl text-gray-900">LibSpace</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/my-bookings"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                My Bookings
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="border-transparent text-blue-600 hover:border-blue-800 hover:text-blue-800 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4 hidden md:block">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-gray-50 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
