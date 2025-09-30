import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, UserCircleIcon, PowerIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'; // Importing icons

function AdminHeader({ toggleSidebar }) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Dummy user data (replace with actual user context/state)
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    };

    const handleLogout = () => {
        // Implement your logout logic here
        console.log("Logging out...");
        // e.g., clear tokens, redirect to login page
    };

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
                <Link to="/admin/dashboard" className="text-xl font-bold text-gray-800 ml-4 md:ml-0 hidden md:block">
                    Admin Panel
                </Link>
            </div>

            {/* Right Section: User Profile Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-0.5"
                    aria-label="User menu"
                >
                    <img
                        className="h-9 w-9 rounded-full object-cover"
                        src={user.avatar}
                        alt={user.name}
                    />
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                        {user.name}
                    </span>
                    <UserCircleIcon className="h-6 w-6 text-gray-500 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                    <div
                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                    >
                        <div className="px-4 py-3 border-b border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="py-1">
                            <Link
                                to="/user/profile" // Link to user profile, assuming it's under /user
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150"
                                role="menuitem"
                            >
                                <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                                Profile Settings
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

export default AdminHeader;