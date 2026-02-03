"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (simplified)
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={user ? "/feed" : "/"} className="flex items-center">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold">SM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SkillMatrix</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  {user.role === 'student' && (
                    <Link href="/feed" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium">
                      Feed
                    </Link>
                  )}
                  {user.role === 'staff' && (
                    <Link href="/staff" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium">
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium">
                      Admin
                    </Link>
                  )}
                  <Link href={`/profile/${user.registerNumber || user.staffId}`} className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium">
                    Profile
                  </Link>
                </div>
                <div className="flex items-center">
                  <span className="mr-4 text-sm text-gray-600 hidden md:inline">
                    {user.name} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}