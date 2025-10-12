import express from 'express';
import {
    getAllUnits,
    getAllUnitsAdmin,
    getUnitById,
    createUnit,
    updateUnit,
    deleteUnit
} from '../controllers/unitController.js';
import { adminProtect } from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllUnits);
router.get('/:id', getUnitById);

// Admin routes
router.get('/admin/all', adminProtect, getAllUnitsAdmin);
router.post('/', adminProtect, createUnit);
router.put('/:id', adminProtect, updateUnit);
router.delete('/:id', adminProtect, deleteUnit);

export default router;
