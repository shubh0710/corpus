import express from "express";
import { Mix } from "../models/Mix.js";
import { validateMix } from "../validateMix.js";

// A Router is a small set of doors that can be fixed onto the app under one sign.
// app.js mounts this one at /api/mixes, so "/" here means /api/mixes.
export const mixesRouter = express.Router();

// POST /api/mixes: save a new mix. The package arrives in req.body (express.json in
// app.js unpacked it). The guard checks it first; a broken rule means 400 "bad request"
// with the message, and we stop there (return). Otherwise save it and answer 201
// "created" with the saved mix, which now has its _id and createdAt.
// Only name and shares are passed on, so nothing else that was sent gets saved.
mixesRouter.post("/", async (req, res) => {
    const problem = validateMix(req.body);
    if (problem) {
        return res.status(400).json({ error: problem });
    }

    const mix = await Mix.create({ name: req.body.name, shares: req.body.shares });
    res.status(201).json(mix);
});

// GET /api/mixes: every saved mix, newest first (-1 means "biggest first", so the
// latest createdAt comes first). res.json answers 200 "OK" when no status is set.
mixesRouter.get("/", async (req, res) => {
    const mixes = await Mix.find().sort({ createdAt: -1 });
    res.json(mixes);
});

// DELETE /api/mixes/:id: delete one mix. ":id" is a placeholder in the address: for
// /api/mixes/6706f1c2..., req.params.id is "6706f1c2...". findByIdAndDelete gives back
// the mix it deleted, or null if there was no mix with that _id. No mix means 404
// "not found" with a message. Otherwise 204 "no content": done, and nothing to send
// back, so .end() finishes the answer with an empty body.
mixesRouter.delete("/:id", async (req, res) => {
    const deleted = await Mix.findByIdAndDelete(req.params.id);
    if (deleted === null) {
        return res.status(404).json({ error: "Mix not found" });
    }

    res.status(204).end();
});