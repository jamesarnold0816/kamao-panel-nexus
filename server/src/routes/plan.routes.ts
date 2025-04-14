import express from 'express';
import {
  getAllPlanRequests,
  getResellerPlanRequests,
  createPlanRequest,
  approvePlanRequest,
  rejectPlanRequest
} from '../controllers/plan.controller';
import { verifyToken, isAdmin, isReseller, isAdminOrSelf } from '../middleware/auth.middleware';

const router = express.Router();

// Admin routes
router.get('/', verifyToken, isAdmin, getAllPlanRequests);
router.put('/:id/approve', verifyToken, isAdmin, approvePlanRequest);
router.put('/:id/reject', verifyToken, isAdmin, rejectPlanRequest);

// Reseller routes
router.get('/reseller/:resellerId', verifyToken, isAdminOrSelf, getResellerPlanRequests);
router.post('/', verifyToken, isReseller, createPlanRequest);

export default router; 