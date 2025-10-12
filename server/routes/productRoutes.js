import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProductsAdmin,
    getProductsByCategory
} from '../controllers/productController.js';

import { uploadSingle, uploadProductFiles } from '../middlewares/uploadMiddleware.js';
import { adminProtect } from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProductById);

// Protected routes (Admin only)
router.post('/', adminProtect, uploadProductFiles, createProduct);
router.put('/:id', adminProtect, uploadProductFiles, updateProduct);
router.delete('/:id', adminProtect, deleteProduct);

// Admin specific routes
router.get('/admin/all', adminProtect, getAllProductsAdmin);

export default router;
