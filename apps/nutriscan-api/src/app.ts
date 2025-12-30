import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { AppError } from "./utils/error";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import foodRoutes from "./routes/foodRoutes";
import logRoutes from "./routes/logRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import devRoutes from "./routes/devRoutes";

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin access to uploads
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to NutriScan API" });
});

app.get("/api", (req, res) => {
  res.json({ status: "success", message: "NutriScan API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dev", devRoutes);

// 404 Handler
// app.all("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
