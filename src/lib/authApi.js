// The page's helpers for accounts: sign up, log in, and "who am I?". Components call these
// and never build requests themselves (the same split as routes and controllers on the server).
// The addresses are relative (/api/...): the page asks its own door, and in development
// Vite's proxy forwards them to the Express server (see vite.config.js).
// All three go through ask() (in api.js): knock, read the JSON answer, throw the
// server's message if it says no, or a friendly one if it can't be reached.
import { ask } from "./api.js";

// Sign-up and log-in send the same package, { email, password } as JSON, to different doors
function sendCredentials(url, email, password) {
    return ask(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
}

// POST /api/auth/register. Gives back { token, user }.
export function signUp(email, password) {
    return sendCredentials("/api/auth/register", email, password);
}

// POST /api/auth/login. Gives back { token, user }.
export function logIn(email, password) {
    return sendCredentials("/api/auth/login", email, password);
}

// GET /api/auth/me, wearing the wristband in the Authorization header. The server answers
// { user: { id, email } }; this gives back just the user inside.
export async function getMe(token) {
    const answer = await ask("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    return answer.user;
}