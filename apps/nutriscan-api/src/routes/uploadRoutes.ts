import { Router, Request, Response, NextFunction } from "express";
import { protect } from "../middleware/authMiddleware";
import { upload, uploadAvatar, uploadFoodImage } from "../controllers/uploadController";

const router = Router();

// Debug middleware
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log("[Upload Route] Request received:", req.method, req.path);
  console.log("[Upload Route] Content-Type:", req.headers["content-type"]);
  next();
});

// POST /api/upload/avatar - Upload avatar image
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
router.post("/food", protect, upload.single("food"), uploadFoodImage);

export default router;
