import express from "express";
import { getProfile, updateProfile, deleteAccount } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect); // All routes protected

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.delete("/profile", deleteAccount);

export default router;
