import express from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrdersAdmin,
    updateOrderStatusAdmin,
    generateOrderReceipt
} from '../controllers/orderController.js';
import { shopProtect } from '../middlewares/shopAuthMiddleware.js';
import { adminProtect } from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Admin routes (require admin authentication) - must come before shop routes
router.get('/admin', adminProtect, getAllOrdersAdmin);
router.put('/admin/:id/status', adminProtect, updateOrderStatusAdmin);
router.get('/admin/:id/receipt', adminProtect, generateOrderReceipt);

// Shop user routes (require shop authentication)
router.use(shopProtect); // Apply shop authentication to all remaining routes
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
