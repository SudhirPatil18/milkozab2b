import React from 'react';
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const CartToast = ({ isVisible, onClose, product, onViewCart }) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleViewCart = () => {
    onViewCart();
    navigate('/cart');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-md mx-auto">
        <div className="flex items-start space-x-3">
          {/* Product Image */}
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={product.photo?.startsWith('http') ? product.photo : `https://api.milkoza.in${product.photo}`}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Added to cart successfully!
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm font-semibold text-green-600">
                    ₹{product.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.quantity} {product.unit?.symbol || 'kg'}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleViewCart}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span>View Cart</span>
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-xs font-medium border border-gray-300 rounded-lg transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartToast;
