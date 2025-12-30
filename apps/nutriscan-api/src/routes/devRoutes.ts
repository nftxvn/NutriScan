import express from "express";
import { toggleRole } from "../controllers/devController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/toggle-role", protect, toggleRole);

export default router;
