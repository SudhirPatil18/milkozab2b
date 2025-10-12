import express from 'express';
import {
    registerShop,
    loginShop,
    getShopProfile,
    updateShopProfile,
    changeShopPassword,
    logoutShop
} from '../controllers/shopController.js';
import { shopProtect } from '../middlewares/shopAuthMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerShop);
router.post('/login', loginShop);

// Protected routes (require authentication)
router.get('/profile', shopProtect, getShopProfile);
router.put('/profile', shopProtect, updateShopProfile);
router.put('/change-password', shopProtect, changeShopPassword);
router.post('/logout', shopProtect, logoutShop);

export default router;
