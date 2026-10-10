// The page's helpers for accounts: sign up, log in, and "who am I?". Components call these
// and never build requests themselves (the same split as routes and controllers on the server).
// The addresses are relative (/api/...): the page asks its own door, and in development
// Vite's proxy forwards them to the Express server (see vite.config.js).

// What all three do: knock, read the JSON answer, and throw if the answer isn't OK.
// response.ok is true for statuses 200-299. For 400, 401 or 409 the server's answer is
// { error: "a friendly message" }, so throwing new Error(answer.error) lets a component
// simply show error.message.
// Two steps can fail before there's any answer to read: fetch itself (no connection), or
// json() (the answer isn't JSON; with the server stopped, Vite's proxy sends an empty
// body). Either way the person can't do anything with the technical message, so the
// try / catch swaps it for one they can act on. let declares the two names before the
// try, so they still exist after it.
async function ask(url, options) {
    let response;
    let answer;
    try {
        response = await fetch(url, options);
        answer = await response.json();
    } catch {
        throw new Error("Couldn't reach the server. Please try again.");
    }
    if (!response.ok) {
        throw new Error(answer.error);
    }
    return answer;
}

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