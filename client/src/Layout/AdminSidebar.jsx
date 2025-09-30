import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    UserGroupIcon,
    ShoppingCartIcon,
    Cog6ToothIcon,
    ChartPieIcon,
    XMarkIcon // For close button on mobile
} from '@heroicons/react/24/outline';

const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon }, // Example route
    { name: 'Products', href: '/admin/products', icon: ShoppingCartIcon }, // Example route
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon }, // Example route
    { name: 'Reports', href: '/admin/reports', icon: ChartPieIcon }, // Example route
];

function AdminSidebar({ isOpen, toggleSidebar }) {
    return (
        <>
            {/* Overlay for mobile when sidebar is open */}
            {isOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    aria-hidden="true"
                ></div>
            )}

            {/* Sidebar itself */}
            <div
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:flex md:flex-col`}
            >
                <div className="flex items-center justify-between h-16 px-4 bg-gray-900 shadow-md">
                    <NavLink to="/admin/dashboard" className="text-xl font-bold text-white tracking-wide">
                        AdminPanel
                    </NavLink>
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1.5 transition-colors duration-200"
                        aria-label="Close sidebar"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={toggleSidebar} // Close sidebar on mobile when a link is clicked
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                                ${isActive
                                    ? 'bg-indigo-700 text-white shadow-md'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    );
}

export default AdminSidebar;