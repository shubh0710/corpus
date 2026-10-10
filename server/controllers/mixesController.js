import { Mix } from "../models/Mix.js";
import { validateMix } from "../validateMix.js";

// The work behind the saved-mix doors. routes/mixes.js says which address goes to which
// function, and puts the guard in front of all of them, so req.userId (who is asking) is
// always set by the time any function here runs.

// POST /api/mixes: save a new mix. The package arrives in req.body (express.json in
// app.js unpacked it). The guard checks it first; a broken rule means 400 "bad request"
// with the message, and we stop there (return). Otherwise save it and answer 201
// "created" with the saved mix, which now has its _id and createdAt.
// Only name and shares are passed on, so nothing else that was sent gets saved. The owner
// comes from the wristband, never from the package, so nobody can save a mix as someone else.
export async function saveMix(req, res) {
    const problem = validateMix(req.body);
    if (problem) {
        return res.status(400).json({ error: problem });
    }

    const mix = await Mix.create({ name: req.body.name, shares: req.body.shares, owner: req.userId });
    res.status(201).json(mix);
}

// GET /api/mixes: your saved mixes only, newest first (-1 means "biggest first", so the
// latest createdAt comes first). res.json answers 200 "OK" when no status is set.
export async function listMixes(req, res) {
    const mixes = await Mix.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json(mixes);
}

// DELETE /api/mixes/:id: delete one mix, only if it's yours. ":id" is a placeholder in the
// address: for /api/mixes/6706f1c2..., req.params.id is "6706f1c2...". findOneAndDelete
// looks for a mix matching BOTH this _id and this owner, deletes it and gives it back, or
// gives back null. Someone else's mix looks exactly like a missing one: 404 "not found",
// so B can't even learn that A's mix exists. Otherwise 204 "no content": done, and nothing
// to send back, so .end() finishes the answer with an empty body.
export async function deleteMix(req, res) {
    const deleted = await Mix.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (deleted === null) {
        return res.status(404).json({ error: "Mix not found" });
    }

    res.status(204).end();
}