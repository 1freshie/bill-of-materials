import express from "express";
import { login, register } from "../controllers/authController.js";

const router = express.Router();

// Дефинираме POST заявка за /login
router.post("/login", login);
// Дефинираме POST заявка за /register
router.post("/register", register);

export default router;
