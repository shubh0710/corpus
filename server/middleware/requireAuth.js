import jwt from "jsonwebtoken";

// The guard at the door. It runs before a door's own code and checks the wristband.
// A good wristband: it writes who this is on req.userId and calls next(), which waves the
// request through to the door. Anything else: it answers 401 itself, and the door never runs.
export function requireAuth(req, res, next) {
    // The wristband travels in the Authorization header as "Bearer <token>".
    // req.get reads a header. ?? means "if it's missing, use empty text instead".
    const header = req.get("Authorization") ?? "";
    if (!header.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Log in first." });
    }

    // Everything after "Bearer " (7 characters, counting the space) is the token
    const token = header.slice(7);

    // jwt.verify checks the stamp (made with our secret?) and the run-out time (exp).
    // If either is wrong it throws an error instead of answering, so try / catch turns that
    // into a 401. If it's good, it gives back what's inside: { userId, iat, exp }.
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
    } catch {
        return res.status(401).json({ error: "Log in again." });
    }

    next();
}