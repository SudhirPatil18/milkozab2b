import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CategorySidebar from '../components/CategorySidebar';
import { useCart } from '../contexts/CartContext';
import CartToast from '../components/CartToast';

function Category() {
  const { categoryId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastProduct, setToastProduct] = useState(null);
  
  const { addToCart } = useCart();

  // Handle add to cart
  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setToastProduct(product);
    setShowToast(true);
    
    // Auto hide toast after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  const handleViewCart = () => {
    setShowToast(false);
  };

  // Fetch category details
  const fetchCategory = async () => {
    try {
      setCategoryLoading(true);
      const response = await fetch(`https://api.milkoza.in/api/categories/${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedCategory(data.data);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Fetch products for this category
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch products from API
      const response = await fetch(`https://api.milkoza.in/api/products/category/${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts();
    }
  }, [selectedCategory]);

  // Handle category selection from sidebar - smooth transition
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setLoading(true);
    
    // Smooth transition with loading state
    setTimeout(() => {
      if (category) {
        // In real app, fetch products for this category
        fetchProducts();
      } else {
        setProducts([]);
      }
      setLoading(false);
    }, 100); // Small delay for smooth UX
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
            <p className="text-gray-600 mb-4">The category you're looking for doesn't exist.</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img
                src={selectedCategory.photo.startsWith('http') ? selectedCategory.photo : `https://api.milkoza.in${selectedCategory.photo}`}
                alt={selectedCategory.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64x64?text=📦';
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedCategory.name}</h1>
              <p className="text-gray-600 mt-1">
                Discover amazing products in {selectedCategory.name} category
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-2 sm:gap-3 lg:gap-4">
          {/* Left Sidebar - Categories */}
          <CategorySidebar 
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />

          {/* Right Side - Product Grid */}
          <div className="flex-1 min-w-0">
            <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-220px)] lg:h-[calc(100vh-240px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100 hover:scrollbar-thumb-green-400">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-4">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                      <div className="relative">
                        <img
                          src={product.photo.startsWith('http') ? product.photo : `https://api.milkoza.in${product.photo}`}
                          alt={product.name}
                          className="w-full h-28 sm:h-32 md:h-36 lg:h-40 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                        <div className="absolute top-1 left-1 bg-white text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded-full shadow-sm flex items-center space-x-1">
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs">11 MINS</span>
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 text-xs mb-1">{product.category?.name}</h3>
                        <h4 className="font-medium text-gray-800 text-xs mb-1 line-clamp-2 leading-tight">{product.name}</h4>
                        <p className="text-gray-500 text-xs mb-1 line-clamp-2">{product.shortDescription}</p>
                        <p className="text-gray-500 text-xs mb-2">Qty: {product.quantity} {product.unit?.symbol || 'kg'}</p>
                        
                        <div className="flex items-center space-x-1 mb-3">
                          <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-xs text-gray-500 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-xs shadow-sm hover:shadow-md"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {products.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm">
                          No products available in {selectedCategory.name} category
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Cart Toast */}
      {toastProduct && (
        <CartToast
          isVisible={showToast}
          onClose={handleCloseToast}
          product={toastProduct}
          onViewCart={handleViewCart}
        />
      )}
    </div>
  );
}

export default Category;