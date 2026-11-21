import express from 'express';
import { getProducts, getProductById, createProduct } from '../controllers/productsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getProducts);
router.get('/:id', verifyToken, getProductById);
router.post('/', verifyToken, createProduct);

export default router;