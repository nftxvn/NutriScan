import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getSummary } from "../controllers/analyticsController";

const router = express.Router();

router.get("/summary", protect, getSummary);

export default router;
