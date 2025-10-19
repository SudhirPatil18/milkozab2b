import express from 'express';
import {
    registerHeadAdmin,
    loginHeadAdmin,
    logoutHeadAdmin,
    getHeadAdminProfile,
    updateHeadAdminProfile,
    getHeadAdminOrders,
    updateOrderStatus,
    getHeadAdminAdmins,
    blockUnblockAdmin,
    verifyAdmin,
    deleteAdmin
} from '../controllers/headAdminController.js';
import {
    getAllShops,
    getShopById,
    toggleShopBlock,
    toggleShopVerification,
    deleteShop
} from '../controllers/adminController.js';
import { 
    getAllCategoriesAdmin,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/headAdminCategoryController.js';
import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import headAdminAuthMiddleware from '../middlewares/headAdminAuthMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerHeadAdmin);
router.post('/login', loginHeadAdmin);

// Protected routes
router.post('/logout', headAdminAuthMiddleware, logoutHeadAdmin);
router.get('/profile', headAdminAuthMiddleware, getHeadAdminProfile);
router.put('/profile', headAdminAuthMiddleware, updateHeadAdminProfile);
router.get('/orders', headAdminAuthMiddleware, getHeadAdminOrders);
router.put('/orders/:id/status', headAdminAuthMiddleware, updateOrderStatus);
router.get('/admins', headAdminAuthMiddleware, getHeadAdminAdmins);
router.put('/admins/:id/block', headAdminAuthMiddleware, blockUnblockAdmin);
router.put('/admins/:id/verify', headAdminAuthMiddleware, verifyAdmin);
router.delete('/admins/:id', headAdminAuthMiddleware, deleteAdmin);

// Shop management routes (HeadAdmin can manage shops)
router.get('/shops', headAdminAuthMiddleware, getAllShops);
router.get('/shops/:id', headAdminAuthMiddleware, getShopById);
router.put('/shops/:id/block', headAdminAuthMiddleware, toggleShopBlock);
router.put('/shops/:id/verify', headAdminAuthMiddleware, toggleShopVerification);
router.delete('/shops/:id', headAdminAuthMiddleware, deleteShop);

// Category management routes (HeadAdmin can manage categories)
router.get('/categories', headAdminAuthMiddleware, getAllCategoriesAdmin);
router.post('/categories', headAdminAuthMiddleware, uploadSingle, createCategory);
router.put('/categories/:id', headAdminAuthMiddleware, uploadSingle, updateCategory);
router.delete('/categories/:id', headAdminAuthMiddleware, deleteCategory);

export default router;
