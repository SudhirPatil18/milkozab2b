import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    PhoneIcon, 
    EnvelopeIcon, 
    MapPinIcon, 
    ClockIcon,
    TruckIcon,
    ShieldCheckIcon,
    CreditCardIcon,
    DevicePhoneMobileIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter a valid email address');
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Thank you for subscribing to our newsletter!');
            setEmail('');
        } catch (error) {
            toast.error('Failed to subscribe. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Company Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">M</span>
                            </div>
                            <span className="text-2xl font-bold">MilkozaB2B</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed max-w-md">
                            Premium grocery delivery service for hotels and restaurants. 
                            Get fresh, quality products delivered to your business with 
                            special bulk pricing and fast delivery.
                        </p>
                        
                        {/* Newsletter Signup */}
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
                            <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                >
                                    {isSubmitting ? '...' : 'Subscribe'}
                                </button>
                            </form>
                        </div>

                        {/* Social Media Links */}
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.007 0C5.373 0 .007 5.373.007 12s5.366 12 12 12 12-5.373 12-12S18.641 0 12.007 0zM8.5 17.5c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm7 0c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/category" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    My Cart
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Categories</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Fruits & Vegetables
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Dairy Products
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Meat & Seafood
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Grocery & Staples
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Beverages
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                                    Snacks & Bakery
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <MapPinIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">B62, Pocket B, South City I, Sector 49, Gurgaon, Haryana 122001</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <PhoneIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">+91 98765 43210</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <EnvelopeIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">support@milkozab2b.com</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <ClockIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">Mon-Sun: 6:00 AM - 11:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="flex items-center space-x-3">
                            <TruckIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <h4 className="font-semibold text-white">Free Delivery</h4>
                                <p className="text-gray-400 text-sm">On orders above ₹500</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <ShieldCheckIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <h4 className="font-semibold text-white">Secure Payment</h4>
                                <p className="text-gray-400 text-sm">100% secure transactions</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <ClockIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <h4 className="font-semibold text-white">24/7 Support</h4>
                                <p className="text-gray-400 text-sm">Always here to help</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="border-t border-gray-800 pt-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center space-x-4 mb-4 md:mb-0">
                                <span className="text-gray-400 text-sm">We Accept:</span>
                                <div className="flex items-center space-x-2">
                                    <CreditCardIcon className="w-6 h-6 text-gray-400" />
                                    <span className="text-gray-400 text-sm">Cards</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <DevicePhoneMobileIcon className="w-6 h-6 text-gray-400" />
                                    <span className="text-gray-400 text-sm">UPI</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <GlobeAltIcon className="w-6 h-6 text-gray-400" />
                                    <span className="text-gray-400 text-sm">Net Banking</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-400 text-sm">Download App:</span>
                                <div className="flex space-x-2">
                                    <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm text-gray-300 transition-colors">
                                        Play Store
                                    </button>
                                    <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm text-gray-300 transition-colors">
                                        App Store
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-sm mb-4 md:mb-0">
                            © 2024 MilkozaB2B. All rights reserved. | Made with ❤️ in India
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-end space-x-6">
                            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                Terms of Service
                            </Link>
                            <Link to="/refund" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                Refund Policy
                            </Link>
                            <Link to="/shipping" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                                Shipping Info
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;