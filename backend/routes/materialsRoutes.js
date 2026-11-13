import express from "express";
import {
  addMaterialPrice,
  createMaterial,
  getMaterialById,
  getMaterials,
  updateMaterial,
} from "../controllers/materialsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Всички раутове тук ще изискват валиден токен
router.use(verifyToken);

router.get("/", getMaterials);
router.post("/", createMaterial);
router.get("/:id", getMaterialById);
router.put("/:id", updateMaterial);
router.post("/:id/prices", addMaterialPrice);

export default router;
