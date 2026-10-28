import express from "express";
import { getNav } from "../controllers/navController.js";

// This file only maps addresses to controller functions (the work is in controllers/navController.js).
// app.js mounts this at /api/nav. ":schemeCode" is a placeholder: for /api/nav/140088,
// req.params.schemeCode is "140088". No wristband needed: fund prices are public.
export const navRouter = express.Router();

navRouter.get("/:schemeCode", getNav);