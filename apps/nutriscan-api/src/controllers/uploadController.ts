import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AuthRequest } from "../middleware/authMiddleware";
import { catchAsync } from "../utils/error";

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = (req as AuthRequest).user?.id || "unknown";
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `avatar-${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const uploadAvatar = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ status: "fail", message: "No file uploaded" });
  }

  // Build the public URL for the uploaded file
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

  res.status(200).json({
    status: "success",
    data: {
      url: avatarUrl,
      filename: req.file.filename,
    },
  });
});

export const uploadFoodImage = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ status: "fail", message: "No file uploaded" });
  }

  // Build the public URL for the uploaded file
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  // We are reusing the avatars/ directory for simplicity or we can change destination. 
  // The current multer storage is hardcoded to uploads/avatars in this file.
  // To support multiple directories, we need to make storage dynamic or just use one folder.
  // For now, let's just use the same folder to avoid refactoring storage logic too much, 
  // or simple refactor: check req.url or similar in storage? Multer storage doesn't easy access req params before file?
  // Actually req is available. 
  
  // Let's just keep it simple and store in the same place for now, or make a separate multer instance?
  // The file has a single `storage` const.
  // Let's just use the same folder but maybe prefix filename?
  // The filename already has `avatar-` prefix.
  // Let's just user generic upload for now or if I want `food-` prefix I need to change storage.
  
  const fileUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

  res.status(200).json({
    status: "success",
    data: {
      url: fileUrl,
      filename: req.file.filename,
    },
  });
});
