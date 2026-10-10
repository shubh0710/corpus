// Checks the sign-up and log-in doors (POST /api/auth/register and /api/auth/login) against a
// real database, in the practice cabinet (corpus-test). Run it from inside server/:
//   node --env-file=.env auth-api-check.mjs
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { app } from "./app.js";
import { User } from "./models/User.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// A fresh email every run: Date.now() is the number of milliseconds since 1970, so it's
// different each time, and re-running never bumps into last run's account.
const email = `check-${Date.now()}@example.com`;
const password = "longenough";
const WRONG = "Wrong email or password.";

// The practice cabinet: dbName "corpus-test" overrides the "corpus" in the address
await mongoose.connect(process.env.MONGODB_URI, { dbName: "corpus-test" });

// Open the server on any free door, then knock on it from inside
const server = app.listen(0, async () => {
    // try / finally: whatever happens, finally cleans up, closes the door and hangs up
    try {
        const address = `http://localhost:${server.address().port}/api/auth`;

        // Sends { email, password } as JSON to one of the two doors, and gives back the response.
        // Every knock below is the same shape, so it's written once here.
        function knock(door, body) {
            return fetch(`${address}/${door}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        }

        // ---- sign up ----
        // The status is checked before .json(), so a crash shows as a FAIL line first.
        const registerResponse = await knock("register", { email, password });
        report("register: status", registerResponse.status, 201);
        const registered = await registerResponse.json();
        report("register: the token is text", typeof registered.token, "string");
        // jwt.decode reads what's inside a token without checking the stamp (fine in a test).
        // iat is when it was made and exp when it runs out, both in seconds, so the gap
        // should be one week: 7 days × 24 hours × 60 minutes × 60 seconds = 604,800.
        const { iat, exp } = jwt.decode(registered.token);
        report("register: the token lasts 7 days", exp - iat, 7 * 24 * 60 * 60);
        // Turn the whole answer back into text and search it: the scrambled password must
        // never leave the server, not even hidden somewhere inside. Checked before the email
        // line, which crashes if the answer has no "user" part.
        report("register: no passwordHash anywhere", JSON.stringify(registered).includes("passwordHash"), false);
        report("register: the email", registered.user.email, email);

        // ---- sign up again with the same email ----
        const againResponse = await knock("register", { email, password });
        report("register again: status", againResponse.status, 409);
        const again = await againResponse.json();
        report("register again: error", again.error, "An account with this email already exists.");

        // ---- the same email in capitals with spaces: tidied, so it's still the same person ----
        const shoutyResponse = await knock("register", { email: ` ${email.toUpperCase()} `, password });
        report("register in capitals with spaces: status", shoutyResponse.status, 409);

        // ---- log in with the right password ----
        const loginResponse = await knock("login", { email, password });
        report("log in: status", loginResponse.status, 200);
        const loggedIn = await loginResponse.json();
        report("log in: the token is text", typeof loggedIn.token, "string");

        // ---- log in with the wrong password ----
        const wrongResponse = await knock("login", { email, password: "not-the-password" });
        report("wrong password: status", wrongResponse.status, 401);
        const wrong = await wrongResponse.json();
        report("wrong password: error", wrong.error, WRONG);

        // ---- log in with an email nobody signed up with: the same answer ----
        const strangerResponse = await knock("login", { email: `nobody-${email}`, password });
        report("unknown email: status", strangerResponse.status, 401);
        const stranger = await strangerResponse.json();
        report("unknown email: error", stranger.error, WRONG);

        // ---- /me: "who am I?", answered only for someone wearing a good wristband ----
        // The wristband travels in the Authorization header as "Bearer <token>".
        // No method given means GET.
        const meResponse = await fetch(`${address}/me`, { headers: { Authorization: `Bearer ${registered.token}` } });
        report("/me with the token: status", meResponse.status, 200);
        const me = await meResponse.json();
        report("/me with the token: email", me.user.email, email);

        // No wristband at all
        const noTokenResponse = await fetch(`${address}/me`);
        report("/me with no token: status", noTokenResponse.status, 401);
        const noToken = await noTokenResponse.json();
        report("/me with no token: error", noToken.error, "Log in first.");

        // A wristband that's fake: right shape ("Bearer ..."), but not a real token
        const junkResponse = await fetch(`${address}/me`, { headers: { Authorization: "Bearer junk" } });
        report("/me with Bearer junk: status", junkResponse.status, 401);
        const junk = await junkResponse.json();
        report("/me with Bearer junk: error", junk.error, "Log in again.");

        console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);
    } finally {
        // Remove the practice account, then close the door and hang up
        await User.deleteOne({ email });
        server.close();
        await mongoose.disconnect();
    }
});