import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const CategorySidebar = ({ onCategorySelect, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://api.milkoza.in/api/categories');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      } else {
        console.error('API returned error:', data.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle category click - smooth selection without navigation
  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
    // No navigation - just update the content area
  };

  if (loading) {
    return (
      <div className="w-36 sm:w-40 lg:w-48 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-2 sm:p-3 border-b border-gray-200">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-900">Categories</h2>
          </div>
          <div className="p-4 text-center">
            <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500 mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-1/4 sm:w-40 lg:w-48 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-1 sm:p-3 border-b border-gray-200">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-900 hidden sm:block">Categories</h2>
          <h2 className="text-xs font-semibold text-gray-900 sm:hidden">Cat</h2>
        </div>
        <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] lg:h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100 hover:scrollbar-thumb-green-400">
          {/* All Products Option */}
          <button
            onClick={() => handleCategoryClick(null)}
            className={`w-full flex flex-col items-center space-y-1 px-2 sm:px-3 py-2 sm:py-3 text-center hover:bg-gray-50 transition-all duration-300 category-transition ${
              !selectedCategory
                ? 'bg-green-50 border-r-3 border-green-500 text-green-700 shadow-sm'
                : 'text-gray-700 hover:shadow-sm'
            }`}
          >
            {/* Round All Products Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 relative">
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm">
                <span className="text-white text-lg font-bold">🛒</span>
              </div>
            </div>
            
            {/* All Products Text */}
            <span className="font-medium text-xs text-center leading-tight">
              All Products
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category)}
              className={`w-full flex flex-col items-center space-y-1 px-2 sm:px-3 py-2 sm:py-3 text-center hover:bg-gray-50 transition-all duration-300 category-transition ${
                selectedCategory && selectedCategory._id === category._id
                  ? 'bg-green-50 border-r-3 border-green-500 text-green-700 shadow-sm'
                  : 'text-gray-700 hover:shadow-sm'
              }`}
            >
              {/* Round Category Image */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 relative">
                <img
                  src={category.photo.startsWith('http') ? category.photo : `https://api.milkoza.in${category.photo}`}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-full border-2 border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center hidden border-2 border-gray-200 shadow-sm">
                  <span className="text-lg">📦</span>
                </div>
              </div>
              
              {/* Category Name */}
              <span className="font-medium text-xs text-center leading-tight">
                {category.name}
              </span>
            </button>
          ))}

          {categories.length === 0 && !loading && (
            <div className="p-2 sm:p-3 text-center">
              <p className="text-xs text-gray-500">No categories available</p>
              <button 
                onClick={fetchCategories}
                className="mt-2 text-xs text-green-600 hover:text-green-700 underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="p-2 sm:p-3 text-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
