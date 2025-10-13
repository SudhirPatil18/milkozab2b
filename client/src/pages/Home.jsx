import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CategorySidebar from '../components/CategorySidebar'
import { useCart } from '../contexts/CartContext'
import CartToast from '../components/CartToast'

function Home() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastProduct, setToastProduct] = useState(null)
  
  const { addToCart } = useCart()

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

  // Fetch products from API
  const fetchProducts = async (categoryId = null) => {
    try {
      setLoading(true);
      let url = 'https://api.milkoza.in/api/products';
      if (categoryId) {
        url = `https://api.milkoza.in/api/products/category/${categoryId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        if (categoryId) {
          setFilteredProducts(data.data);
        } else {
          setAllProducts(data.data);
          setFilteredProducts(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection - smooth transition without page reload
  const handleCategorySelect = (category) => {
    setIsTransitioning(true);
    setSelectedCategory(category);
    setLoading(true);
    
    // Smooth transition with loading state
    setTimeout(() => {
      if (category) {
        fetchProducts(category._id);
      } else {
        setFilteredProducts(allProducts);
        setLoading(false);
      }
      setIsTransitioning(false);
    }, 150); // Small delay for smooth UX
  };

  // Initialize with all products
  useEffect(() => {
    fetchProducts();
  }, [])


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
             <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
               <div className="flex gap-1 sm:gap-3 lg:gap-4">
          {/* Left Sidebar - Categories (Dynamic) */}
          <CategorySidebar 
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />

                 {/* Right Side - Product Grid (More Space) */}
                 <div className="flex-1 min-w-0 relative">
                   {/* Transition Overlay */}
                   {isTransitioning && (
                     <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
                       <div className="flex flex-col items-center space-y-3">
                         <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                         <p className="text-sm text-gray-600 font-medium">
                           {selectedCategory ? `Switching to ${selectedCategory.name}...` : 'Loading all products...'}
                         </p>
                       </div>
                     </div>
                   )}
                   
                   <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] lg:h-[calc(100vh-160px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100 hover:scrollbar-thumb-green-400">
              {/* Category Header */}
              {selectedCategory && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800">
                    {selectedCategory.name} Products
                  </h3>
                  <p className="text-sm text-green-600">
                    Showing {filteredProducts.length} products in this category
                  </p>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 pb-4">
                  {/* Skeleton loading cards */}
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="loading-shimmer h-32 sm:h-40"></div>
                      <div className="p-3">
                        <div className="loading-shimmer h-4 w-3/4 mb-2"></div>
                        <div className="loading-shimmer h-3 w-1/2 mb-2"></div>
                        <div className="loading-shimmer h-3 w-1/3 mb-3"></div>
                        <div className="loading-shimmer h-8 w-full rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 pb-4 animate-fadeIn">
                  {filteredProducts.map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 block">
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
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-200 text-xs shadow-sm hover:shadow-md"
                      >
                        ADD
                      </button>
                    </div>
                </Link>
                  ))}
                  
                  {filteredProducts.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm">
                          {selectedCategory 
                            ? `No products available in ${selectedCategory.name} category`
                            : 'No products available'
                          }
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
  )
}

export default Home
