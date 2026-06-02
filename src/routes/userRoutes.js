import express from 'express';
import { register, login, getProfile } from '../controllers/userController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(register)
  .get((req, res) => {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed. To register a new user, please send a POST request with name, email, and password.',
      requiredFields: ['name', 'email', 'password']
    });
  });

router.route('/login')
  .post(login)
  .get((req, res) => {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed. To log in, please send a POST request with email and password.',
      requiredFields: ['email', 'password']
    });
  });

router.get('/profile', protect, getProfile);

export default router;
