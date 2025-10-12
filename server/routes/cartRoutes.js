import express from 'express';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartCount
} from '../controllers/cartController.js';
import { shopProtect } from '../middlewares/shopAuthMiddleware.js';

const router = express.Router();

// All cart routes require shop user authentication
router.use(shopProtect);

// Cart routes
router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/items', addToCart);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
