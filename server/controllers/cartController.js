import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (Shop user only)
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id, isActive: true })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'category',
                    select: 'name'
                }
            })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'unit',
                    select: 'name symbol'
                }
            });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    items: [],
                    totalItems: 0,
                    totalPrice: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private (Shop user only)
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate input
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists and is active
        const product = await Product.findOne({ _id: productId, isActive: true });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or inactive'
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user.id, isActive: true });

        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        // Check if product already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity: quantity
            });
        }

        await cart.save();

        // Populate the cart with product details
        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name symbol' }
                ]
            });

        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: populatedCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding item to cart',
            error: error.message
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private (Shop user only)
export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }

        const cart = await Cart.findOne({ user: req.user.id, isActive: true });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        if (quantity === 0) {
            // Remove item if quantity is 0
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();

        // Populate the cart with product details
        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name symbol' }
                ]
            });

        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: populatedCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating cart item',
            error: error.message
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private (Shop user only)
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id, isActive: true });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        // Populate the cart with product details
        const populatedCart = await Cart.findById(cart._id)
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name symbol' }
                ]
            });

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: populatedCart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing item from cart',
            error: error.message
        });
    }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (Shop user only)
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id, isActive: true });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: {
                items: [],
                totalItems: 0,
                totalPrice: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
};

// @desc    Get cart count (for header display)
// @route   GET /api/cart/count
// @access  Private (Shop user only)
export const getCartCount = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id, isActive: true });
        
        const totalItems = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

        res.status(200).json({
            success: true,
            data: {
                totalItems
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cart count',
            error: error.message
        });
    }
};
