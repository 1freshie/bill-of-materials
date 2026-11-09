import express from "express";
import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Дефинираме POST заявка за /login
router.post("/login", login);
// Дефинираме POST заявка за /register
router.post("/register", register);
// Дефинираме POST заявка за /logout
router.post("/logout", logout);
// Добавяме новия раут със защита
router.get("/me", verifyToken, getMe);

export default router;
