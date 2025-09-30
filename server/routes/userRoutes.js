import express from 'express'
import { CreateUser } from '../controllers/userconstroller.js';
const router = express.Router();

router.post('/create-user', CreateUser);

export default router;