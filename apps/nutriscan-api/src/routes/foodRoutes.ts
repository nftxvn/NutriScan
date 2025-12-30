import express from "express";
import { getAllFoods, createFood, updateFood, deleteFood } from "../controllers/foodController";
import { protect, restrictTo } from "../middleware/authMiddleware";

const router = express.Router();

// Authenticated users can read and create (personal) foods
router.use(protect);

router.get("/", getAllFoods);
router.post("/", createFood); 

// Update/Delete operations need careful authorization (Admin or Owner)
// For now, let's keep it open to authenticated and handle logic in controller
router.patch("/:id", updateFood); 
router.delete("/:id", deleteFood); 

export default router;
