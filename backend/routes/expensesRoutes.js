
import express from "express";
import {
  getExpenses,
  createExpense,
} from "../controllers/expensesController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getExpenses);
router.post("/", createExpense);

export default router;
