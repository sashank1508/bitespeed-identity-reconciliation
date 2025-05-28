import { Router } from 'express';
import { IdentityController } from '../controllers/IdentityController';

const router = Router();
const identityController = new IdentityController();

// POST /identify endpoint
router.post('/identify', (req, res) => identityController.identify(req, res));

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Bitespeed Identity Service is running' });
});

export default router;