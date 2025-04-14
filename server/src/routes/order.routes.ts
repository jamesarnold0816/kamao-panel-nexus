import express from 'express';
import { 
  getAllOrders, 
  getOrderById, 
  getResellerOrders,
  createOrder,
  updateOrderStatus,
  addOrderReply
} from '../controllers/order.controller';
import { verifyToken, isAdmin, isReseller, isAdminOrSelf } from '../middleware/auth.middleware';

const router = express.Router();

// Admin routes
router.get('/', verifyToken, isAdmin, getAllOrders);

// Shared routes
router.get('/:id', verifyToken, isAdminOrSelf, getOrderById);

// Reseller routes
router.get('/reseller/:resellerId', verifyToken, isAdminOrSelf, getResellerOrders);
router.post('/', verifyToken, isReseller, createOrder);

// Admin-only routes
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);
router.put('/:id/reply', verifyToken, isAdmin, addOrderReply);

export default router; 