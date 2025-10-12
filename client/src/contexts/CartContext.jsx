import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_CART_DATA':
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalPrice: action.payload.totalPrice || 0,
        loading: false
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  // Fetch cart from backend when user is logged in, or load guest cart
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Load guest cart from localStorage
      loadGuestCart();
    }
  }, [user]);

  // Merge guest cart when user logs in
  useEffect(() => {
    if (user) {
      mergeGuestCart();
    }
  }, [user]);

  const loadGuestCart = () => {
    try {
      const guestCart = localStorage.getItem('milkoza_guest_cart');
      if (guestCart) {
        const cartData = JSON.parse(guestCart);
        dispatch({ type: 'SET_CART_DATA', payload: cartData });
      } else {
        dispatch({ type: 'SET_CART_DATA', payload: { items: [], totalItems: 0, totalPrice: 0 } });
      }
    } catch (error) {
      console.error('Error loading guest cart:', error);
      dispatch({ type: 'SET_CART_DATA', payload: { items: [], totalItems: 0, totalPrice: 0 } });
    }
  };

  const saveGuestCart = (cartData) => {
    try {
      localStorage.setItem('milkoza_guest_cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('shopToken');
      
      if (!token) {
        dispatch({ type: 'SET_CART_DATA', payload: { items: [], totalItems: 0, totalPrice: 0 } });
        return;
      }

      const response = await fetch('http://localhost:7000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CART_DATA', payload: data.data });
      } else {
        dispatch({ type: 'SET_CART_DATA', payload: { items: [], totalItems: 0, totalPrice: 0 } });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      // Handle guest cart
      const existingItem = state.items.find(item => item.product._id === product._id);
      let newItems;
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...state.items, { product, quantity, id: `${product._id}_${Date.now()}` }];
      }
      
      const newCartData = {
        items: newItems,
        totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: newItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      };
      
      dispatch({ type: 'SET_CART_DATA', payload: newCartData });
      saveGuestCart(newCartData);
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('shopToken');
      
      const response = await fetch('http://localhost:7000/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CART_DATA', payload: data.data });
      } else {
        const errorData = await response.json();
        dispatch({ type: 'SET_ERROR', payload: errorData.message || 'Failed to add item to cart' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) {
      // Handle guest cart
      const newItems = state.items.filter(item => item.product._id !== productId);
      const newCartData = {
        items: newItems,
        totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: newItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      };
      
      dispatch({ type: 'SET_CART_DATA', payload: newCartData });
      saveGuestCart(newCartData);
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('shopToken');
      
      const response = await fetch(`http://localhost:7000/api/cart/items/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CART_DATA', payload: data.data });
      } else {
        const errorData = await response.json();
        dispatch({ type: 'SET_ERROR', payload: errorData.message || 'Failed to remove item from cart' });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) {
      // Handle guest cart
      const newItems = state.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity: quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      const newCartData = {
        items: newItems,
        totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
        totalPrice: newItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      };
      
      dispatch({ type: 'SET_CART_DATA', payload: newCartData });
      saveGuestCart(newCartData);
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('shopToken');
      
      const response = await fetch(`http://localhost:7000/api/cart/items/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_CART_DATA', payload: data.data });
      } else {
        const errorData = await response.json();
        dispatch({ type: 'SET_ERROR', payload: errorData.message || 'Failed to update cart item' });
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
    }
  };

  const clearCart = async () => {
    if (!user) {
      // Handle guest cart
      const newCartData = { items: [], totalItems: 0, totalPrice: 0 };
      dispatch({ type: 'SET_CART_DATA', payload: newCartData });
      saveGuestCart(newCartData);
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('shopToken');
      
      const response = await fetch('http://localhost:7000/api/cart', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        dispatch({ type: 'SET_CART_DATA', payload: { items: [], totalItems: 0, totalPrice: 0 } });
      } else {
        const errorData = await response.json();
        dispatch({ type: 'SET_ERROR', payload: errorData.message || 'Failed to clear cart' });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    }
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  const mergeGuestCart = async () => {
    if (!user) return;
    
    try {
      const guestCart = localStorage.getItem('milkoza_guest_cart');
      if (!guestCart) return;
      
      const guestCartData = JSON.parse(guestCart);
      if (guestCartData.items.length === 0) return;
      
      // Clear guest cart first to avoid infinite loops
      localStorage.removeItem('milkoza_guest_cart');
      
      // Add each guest cart item to the logged-in cart
      for (const item of guestCartData.items) {
        // Use direct API call to avoid triggering guest cart logic
        const token = localStorage.getItem('shopToken');
        if (token) {
          await fetch('http://localhost:7000/api/cart/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              productId: item.product._id,
              quantity: item.quantity
            })
          });
        }
      }
      
      // Refresh cart data
      await fetchCart();
    } catch (error) {
      console.error('Error merging guest cart:', error);
    }
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    fetchCart,
    mergeGuestCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
