import express from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllCategoriesAdmin
} from '../controllers/categoryController.js';

import { uploadSingle } from '../middlewares/uploadMiddleware.js';
import { adminProtect } from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes (Admin only)
router.post('/', adminProtect, uploadSingle, createCategory);
router.put('/:id', adminProtect, uploadSingle, updateCategory);
router.delete('/:id', adminProtect, deleteCategory);

// Admin specific routes
router.get('/admin/all',  getAllCategoriesAdmin);

export default router;
