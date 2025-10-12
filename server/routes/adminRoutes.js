import express from 'express';
import { 
    registerAdmin, 
    loginAdmin, 
    getAdminProfile, 
    updateAdminProfile,
    getAllShops,
    getShopById,
    toggleShopBlock,
    toggleShopVerification,
    deleteShop,
    getDashboardStats
} from '../controllers/adminController.js';
import { getAllCategoriesAdmin } from '../controllers/categoryController.js';
import { adminProtect } from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes
router.get('/profile', adminProtect, getAdminProfile);
router.put('/profile', adminProtect, updateAdminProfile);

// Shop management routes
router.get('/shops', adminProtect, getAllShops);
router.get('/shops/:id', adminProtect, getShopById);
router.put('/shops/:id/block', adminProtect, toggleShopBlock);
router.put('/shops/:id/verify', adminProtect, toggleShopVerification);
router.delete('/shops/:id', adminProtect, deleteShop);

// Category management routes
router.get('/categories', adminProtect, getAllCategoriesAdmin);

// Dashboard routes
router.get('/dashboard/stats', adminProtect, getDashboardStats);

export default router;
