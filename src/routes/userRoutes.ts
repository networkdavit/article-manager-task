import express from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, isAdmin } from '../middleware/authMiddleware'; // Import authenticate middleware

const router = express.Router();

router.post('/register', UserController.register);

router.post('/login', UserController.login);

router.delete('/delete/:id', authenticate, isAdmin, (req, res) => {
  const userId = req.params.id;
  res.status(200).json({ message: `User with ID ${userId} deleted.` });
});

export default router;
