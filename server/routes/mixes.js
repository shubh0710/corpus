import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { saveMix, listMixes, deleteMix } from "../controllers/mixesController.js";

// This file only maps addresses to controller functions (the work is in controllers/mixesController.js).
// A Router is a small set of doors that can be fixed onto the app under one sign.
// app.js mounts this one at /api/mixes, so "/" here means /api/mixes.
export const mixesRouter = express.Router();

// The guard stands in front of every door below: no good wristband, no entry.
// Past it, req.userId says who is asking.
mixesRouter.use(requireAuth);

// Each line hands Express a function (no brackets) to run on every visit
mixesRouter.post("/", saveMix);
mixesRouter.get("/", listMixes);
mixesRouter.delete("/:id", deleteMix);