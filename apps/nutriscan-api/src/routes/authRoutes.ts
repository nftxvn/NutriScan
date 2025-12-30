import express from "express";
import { register, login, checkEmail } from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/check-email", checkEmail);

export default router;
