// The page's helpers for saved mixes: save, list and delete. They speak the server's
// language: shares go in, and come back, as a list ([{ schemeCode, share }, ...]). The
// pop-up translates to and from the page's shape with mixShares.js, so each file has one
// job: this one talks to the server, that one translates.
// Every one wears the wristband (Authorization: Bearer <token>), because the server only
// lets you see and change your own mixes. All three go through ask() (in api.js).
import { ask } from "./api.js";

// POST /api/mixes: save a mix under a name. Gives back the saved mix (with its _id and
// createdAt), so the pop-up can put it straight at the top of the list.
export function saveMix(token, name, list) {
    return ask("/api/mixes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, shares: list })
    });
}

// GET /api/mixes: your saved mixes, newest first, as the server sends them
export function listMixes(token) {
    return ask("/api/mixes", { headers: { Authorization: `Bearer ${token}` } });
}

// DELETE /api/mixes/<id>: delete one of your mixes. The server answers 204 "No Content"
// (done, nothing to send back), so there's nothing to give back here either. await waits
// for the answer, so a "not found" still throws its message to whoever called this.
export async function deleteMix(token, id) {
    await ask(`/api/mixes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
}