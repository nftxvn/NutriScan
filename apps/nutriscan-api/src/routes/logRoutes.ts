import express from "express";
import { addLog, getDaily, getRecent, removeLog } from "../controllers/logController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.post("/", addLog);
router.get("/today", getDaily);
router.get("/recent", getRecent);
router.delete("/:logId", removeLog);

export default router;
