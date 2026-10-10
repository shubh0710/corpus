// Checks authApi.js (the page's helpers for signing up, logging in and "who am I?") without a
// server: the real fetch is swapped for a stunt double we control.
// Run it from the project root:   node src/lib/authApi-check.mjs
import { signUp, logIn, getMe } from "./authApi.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// ---- the stunt double ----
const calls = [];                                  // remembers every knock, so we can inspect it
let nextAnswer = { status: 200, body: {} };        // what the fake will "reply" next

// globalThis is where built-in names like fetch live. Setting globalThis.fetch swaps the
// built-in for ours, so every fetch inside authApi.js hits this instead of the network.
// It records what was asked, then replies with an object shaped like a real response:
// ok (true for 200-299), status, and json() giving back the body.
// Two ways to make it misbehave, for the "server is off" cases:
//   fetchFails: true - fetch itself throws, like a real one with no connection at all
//   badJson: true    - the answer arrives but its body isn't JSON (Vite's proxy sends an
//                      empty body when the server is stopped), so json() throws
globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (nextAnswer.fetchFails) {
        throw new TypeError("Failed to fetch");
    }
    return {
        ok: nextAnswer.status >= 200 && nextAnswer.status < 300,
        status: nextAnswer.status,
        json: async () => {
            if (nextAnswer.badJson) {
                throw new SyntaxError("Failed to execute 'json' on 'Response': Unexpected end of JSON input");
            }
            return nextAnswer.body;
        }
    };
};

// .at(-1) is the last item in a list: the knock that just happened
function lastCall() {
    return calls.at(-1);
}

const user = { id: "u1", email: "shubh@example.com" };

const OFFLINE = "Couldn't reach the server. Please try again.";

// ---- logIn, 200 answer ----
nextAnswer = { status: 200, body: { token: "tok123", user } };
const loggedIn = await logIn("shubh@example.com", "longenough");
report("logIn: URL", lastCall().url, "/api/auth/login");
report("logIn: method", lastCall().options.method, "POST");
report("logIn: Content-Type", lastCall().options.headers["Content-Type"], "application/json");
// The body travels as JSON text; JSON.parse turns it back into an object we can look inside
const sent = JSON.parse(lastCall().options.body);
report("logIn: body email", sent.email, "shubh@example.com");
report("logIn: body password", sent.password, "longenough");
report("logIn: gives back the token", loggedIn.token, "tok123");

// ---- logIn, 401 answer: it throws, with the server's own words ----
nextAnswer = { status: 401, body: { error: "Wrong email or password." } };
let message = "no error";
try {
    await logIn("shubh@example.com", "not-the-password");
} catch (error) {
    message = error.message;
}
report("logIn 401: throws the server's message", message, "Wrong email or password.");

// ---- signUp, 201 answer: check its package too, not only its address ----
// A different token from logIn's, so a leftover answer can't pass by accident
nextAnswer = { status: 201, body: { token: "tok456", user } };
const signedUp = await signUp("new@example.com", "brandnewpass");
report("signUp: method", lastCall().options.method, "POST");
const signUpSent = JSON.parse(lastCall().options.body);
report("signUp: body email", signUpSent.email, "new@example.com");
report("signUp: body password", signUpSent.password, "brandnewpass");
report("signUp: gives back the token", signedUp.token, "tok456");

// ---- signUp, 409 answer ----
nextAnswer = { status: 409, body: { error: "An account with this email already exists." } };
message = "no error";
try {
    await signUp("shubh@example.com", "longenough");
} catch (error) {
    message = error.message;
}
report("signUp: URL", lastCall().url, "/api/auth/register");
report("signUp 409: throws the server's message", message, "An account with this email already exists.");

// ---- getMe ----
nextAnswer = { status: 200, body: { user } };
const me = await getMe("abc");
report("getMe: URL", lastCall().url, "/api/auth/me");
report("getMe: Authorization header", lastCall().options.headers.Authorization, "Bearer abc");
// Just the user, not { user: ... }: compare both as JSON text
report("getMe: gives back just the user", JSON.stringify(me), JSON.stringify(user));

// ---- the server can't be reached: a friendly message, not a technical one ----
nextAnswer = { fetchFails: true };
message = "no error";
try {
    await logIn("shubh@example.com", "longenough");
} catch (error) {
    message = error.message;
}
report("no connection: friendly message", message, OFFLINE);

nextAnswer = { status: 500, badJson: true };
message = "no error";
try {
    await logIn("shubh@example.com", "longenough");
} catch (error) {
    message = error.message;
}
report("answer isn't JSON: friendly message", message, OFFLINE);

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);