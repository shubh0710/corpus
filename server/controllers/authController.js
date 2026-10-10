import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { validateCredentials } from "../validateCredentials.js";

// The work behind the sign-up, log-in and "who am I?" doors. routes/auth.js says which
// address goes to which function; each function here does the work for one door.

// The answer both doors send when someone gets in: a token (a signed pass, like a wristband
// at an event) and the few parts of the user the page needs. Never the whole user: that
// would include passwordHash.
// jwt.sign stamps { userId } with our secret. Anyone can read what's inside a token, but
// only someone with the secret can make one, so a changed token fails the check later.
// expiresIn: "7d" writes a run-out time (exp) inside it: after a week it stops working,
// even if it leaks, and the person logs in again.
// Not exported: only register and login in this file use it.
function signedIn(user) {
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return { token, user: { id: user._id, email: user.email } };
}

// POST /api/auth/register: make an account
export async function register(req, res) {
    const problem = validateCredentials(req.body);
    if (problem) {
        return res.status(400).json({ error: problem });
    }

    // Tidy the email the same way the model does, so "  Shubh@X.com " finds "shubh@x.com"
    const email = req.body.email.trim().toLowerCase();
    // { email } is short for { email: email }: find a user whose email is this one
    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Scramble the password. 10 is how many rounds of scrambling (2 to the power 10): slow
    // enough to make guessing expensive, fast enough for one sign-up.
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ email, passwordHash });
    res.status(201).json(signedIn(user));
}

// POST /api/auth/login: check the email and password, and hand over a token
export async function login(req, res) {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email });

    // bcrypt.compare scrambles the typed password the same way and compares the results.
    // No user, or the wrong password: the same message for both, so a stranger can't use
    // this door to find out which emails have accounts. (user && ...) skips the compare
    // when there's no user.
    const passwordMatches = user && await bcrypt.compare(req.body.password, user.passwordHash);
    if (!passwordMatches) {
        return res.status(401).json({ error: "Wrong email or password." });
    }

    res.json(signedIn(user));
}

// GET /api/auth/me: "who am I?" The guard (requireAuth, in routes/auth.js) runs first, so
// only a good wristband reaches this. The guard put the userId from the token on
// req.userId; look that user up and answer with the safe parts only.
// The page will use this to ask "is my saved wristband still good?"
export async function me(req, res) {
    const user = await User.findById(req.userId);
    res.json({ user: { id: user._id, email: user.email } });
}