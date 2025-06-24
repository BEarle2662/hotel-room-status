import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                location.pathname === '/' 
                  ? 'border-blue-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Home className="w-5 h-5 mr-2" />
              Rooms
            </Link>
            <Link
              to="/logs"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                location.pathname === '/logs'
                  ? 'border-blue-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="w-5 h-5 mr-2" />
              Task Logs
            </Link>
          </div>
          <h1 className='text-lg lg:text-3xl font-semibold text-right my-auto'>Hotel Rooms Management System</h1>
        </div>
      </div>
    </nav>
  );
}