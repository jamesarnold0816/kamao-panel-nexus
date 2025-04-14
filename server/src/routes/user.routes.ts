import express from 'express';
import { 
  getAllUsers, 
  getAllResellers, 
  getUserById,
  updateUser,
  updateUserPlan,
  deleteUser
} from '../controllers/user.controller';
import { verifyToken, isAdmin, isAdminOrSelf } from '../middleware/auth.middleware';

const router = express.Router();

// User routes
router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/resellers', verifyToken, isAdmin, getAllResellers);
router.get('/:id', verifyToken, isAdminOrSelf, getUserById);
router.put('/:id', verifyToken, isAdminOrSelf, updateUser);
router.put('/:id/plan', verifyToken, isAdmin, updateUserPlan);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router; 