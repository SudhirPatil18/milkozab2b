import express from 'express';
import {
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from '../controllers/addressController.js';
import { shopProtect } from '../middlewares/shopAuthMiddleware.js';

const router = express.Router();

// All address routes require shop user authentication
router.use(shopProtect);

// Address routes
router.get('/', getUserAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.put('/:id/default', setDefaultAddress);

export default router;
