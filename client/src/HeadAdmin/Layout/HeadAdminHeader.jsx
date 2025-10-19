import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, UserCircleIcon, PowerIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useHeadAdminAuth } from '../../contexts/HeadAdminAuthContext';

function HeadAdminHeader({ toggleSidebar }) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { headAdmin, logout, isAuthenticated } = useHeadAdminAuth();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isUserMenuOpen && !event.target.closest('.headadmin-user-dropdown')) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/headadmin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Don't render if admin is not authenticated
    if (!isAuthenticated()) {
        return null;
    }

    return (
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm border-b border-gray-200 sticky top-0 z-10">
            {/* Left Section: Mobile Sidebar Toggle and Brand/Title */}
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1.5 transition-colors duration-200"
                    aria-label="Toggle sidebar"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
                <Link to="/headadmin/dashboard" className="text-xl font-bold text-gray-800 ml-4 md:ml-0 hidden md:block">
                    Head Admin Panel
                </Link>
            </div>

            {/* Right Section: Head Admin Profile Dropdown */}
            <div className="relative headadmin-user-dropdown">
                <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-0.5 hover:bg-gray-50 transition-colors duration-200"
                    aria-label="Head Admin menu"
                >
                    {/* Head Admin Avatar with Initial */}
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-sm">
                            {headAdmin?.name?.charAt(0)?.toUpperCase() || 'H'}
                        </span>
                    </div>
                    <div className="hidden sm:block text-left">
                        <span className="text-sm font-medium text-gray-700 block">
                            {headAdmin?.name || 'Head Admin'}
                        </span>
                        <span className="text-xs text-gray-500">
                            {headAdmin?.phoneNumber || headAdmin?.email || 'Head Admin'}
                        </span>
                    </div>
                    <UserCircleIcon className="h-5 w-5 text-gray-500 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                    <div
                        className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 border border-gray-200"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="headadmin-menu-button"
                    >
                        <div className="px-4 py-3 border-b border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{headAdmin?.name || 'Head Admin'}</p>
                            <p className="truncate text-xs text-gray-500">{headAdmin?.phoneNumber || headAdmin?.email || 'Head Admin Account'}</p>
                            <p className="text-xs text-gray-400 mt-1">Head Administrator</p>
                        </div>
                        <div className="py-1">
                            <Link
                                to="/headadmin/settings"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                                role="menuitem"
                            >
                                <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                Head Admin Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                                role="menuitem"
                            >
                                <PowerIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                Sign out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

export default HeadAdminHeader;
