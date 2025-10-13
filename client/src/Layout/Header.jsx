import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const { user: shopUser, logout } = useAuth();
    const { totalItems: cartCount } = useCart();


    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    const handleLogout = () => {
        logout();
        setIsUserDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isUserDropdownOpen && !event.target.closest('.user-dropdown')) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserDropdownOpen]);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                {/* Mobile Layout */}
                <div className="md:hidden">
                    {/* Top Row - Logo and Actions */}
                    <div className="flex justify-between items-center h-12">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center space-x-1">
                                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">M</span>
                                </div>
                                <span className="text-lg font-bold text-gray-900">MilkozaB2B</span>
                            </Link>
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="flex items-center space-x-2">
                            {shopUser ? (
                                <>
                                    {/* Cart Button - Mobile for logged-in users */}
                                    <Link 
                                        to="/cart" 
                                        className="relative inline-flex items-center px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 border border-green-200"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <span className="font-medium text-xs">Cart</span>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>

                                    {/* User Profile Button - Mobile Optimized */}
                                    <div className="relative user-dropdown">
                                        <button
                                            onClick={toggleUserDropdown}
                                            className="flex items-center space-x-1 p-1.5 text-gray-700 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                                                <span className="text-white font-bold text-sm">
                                                    {shopUser.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="hidden sm:block">
                                                <span className="text-sm font-medium text-gray-900">{shopUser.name}</span>
                                                <p className="text-xs text-gray-500 truncate max-w-20">{shopUser.phoneNumber}</p>
                                            </div>
                                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        
                                        {/* User Dropdown - Mobile Optimized */}
                                        {isUserDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-56 sm:w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-sm">
                                                                {shopUser.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{shopUser.name}</p>
                                                            <p className="text-xs text-gray-500">{shopUser.phoneNumber}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        to="/cart"
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                    >
                                                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                        </svg>
                                                        Cart
                                                    </Link>
                                                    <Link
                                                        to="/shop/orders"
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                    >
                                                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        Orders
                                                    </Link>
                                                    <Link
                                                        to="/shop/profile"
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                    >
                                                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        Profile
                                                    </Link>
                            <Link 
                                                        to="/shop/settings"
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                                        onClick={() => setIsUserDropdownOpen(false)}
                                                    >
                                                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Settings
                                                    </Link>
                                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                                        >
                                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                                            Logout
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Mobile: Only Login and Cart buttons */}
                                    <div className="flex items-center space-x-2">
                                        {/* Login Button - Mobile Only */}
                                        <Link 
                                            to="/shop-login" 
                                            className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                                        >
                                            Login
                            </Link>

                                        {/* Cart Button */}
                                        <Link 
                                            to="/cart" 
                                            className="relative inline-flex items-center px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 border border-green-200"
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            <span className="font-medium text-xs">Cart</span>
                                            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                                                {cartCount}
                                            </span>
                                        </Link>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="pb-2">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search 'milk'"
                                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm"
                            />
                        </div>
                    </div>

                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">M</span>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">MilkozaB2B</span>
                            </Link>
                        </div>

                        {/* Delivery Info */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium text-green-600">Delivery in 11 minutes</span>
                            </div>
                            <div className="flex items-center space-x-1 ml-4">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>B62, Pocket B, South City I...</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search 'butter'"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-4">
                            {shopUser ? (
                                <>
                                    {/* User Profile Dropdown */}
                                    <div className="relative user-dropdown">
                                        <button
                                            onClick={toggleUserDropdown}
                                            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                                        >
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    {shopUser.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-medium">{shopUser.name}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        
                                        {/* User Dropdown */}
                                        {isUserDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-900">{shopUser.name}</p>
                                                    <p className="text-sm text-gray-500">{shopUser.phoneNumber}</p>
                                                </div>
                                                <Link
                                                    to="/cart"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsUserDropdownOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                    </svg>
                                                    Cart
                                                </Link>
                                                <Link
                                                    to="/shop/orders"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsUserDropdownOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                    Orders
                                                </Link>
                                                <Link
                                                    to="/shop/profile"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsUserDropdownOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Profile
                                                </Link>
                                                <Link
                                                    to="/shop/settings"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setIsUserDropdownOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Settings
                                                </Link>
                                                <div className="border-t border-gray-100"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                            {/* Login Button */}
                            <Link 
                                        to="/shop-login" 
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                            >
                                        Login
                                    </Link>

                                    {/* Register Button */}
                                    <Link 
                                        to="/shop-register" 
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors duration-200"
                                    >
                                         Register
                            </Link>

                            {/* Cart Button */}
                            <Link 
                                to="/cart" 
                                className="relative inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 border border-gray-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="font-medium">My Cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                                </>
                            )}

                            {/* Cart Button - Always visible for logged-in users */}
                            {shopUser && (
                                <Link 
                                    to="/cart" 
                                    className="relative inline-flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors duration-200 border border-green-200"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <span className="font-medium">My Cart</span>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;