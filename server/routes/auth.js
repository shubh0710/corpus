import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { register, login, me } from "../controllers/authController.js";

// This file only maps addresses to controller functions (the work is in controllers/authController.js).
// app.js mounts this at /api/auth. Each line hands Express a function (no brackets) to run
// on every visit; requireAuth before me means the guard checks the wristband first.
export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);