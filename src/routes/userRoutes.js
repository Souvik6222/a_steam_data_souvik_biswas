import express from 'express';
import { register, login, getProfile } from '../controllers/userController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

export default router;
