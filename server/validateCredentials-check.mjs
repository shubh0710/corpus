// Checks validateCredentials: the guard's checklist for an email and password at sign-up.
// No server, no database. Run it from inside server/:   node validateCredentials-check.mjs
import { validateCredentials } from "./validateCredentials.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// The messages we expect, written once
const BAD_EMAIL = "Enter a valid email address.";
const SHORT_PASSWORD = "Password must be at least 8 characters.";

// A pair that follows every rule. The cases below change one thing at a time.
const goodEmail = "shubh@example.com";
const goodPassword = "longenough";

// Each case is [what we're testing, the body that arrives, the answer we expect]
const cases = [
    ["a good pair", { email: goodEmail, password: goodPassword }, null],
    ["spaces around the email are fine", { email: "  shubh@example.com  ", password: goodPassword }, null],

    // rule 1: the email
    ["no email", { password: goodPassword }, BAD_EMAIL],
    ["an email that is a number", { email: 42, password: goodPassword }, BAD_EMAIL],
    ["no @ at all", { email: "shubh", password: goodPassword }, BAD_EMAIL],
    ["nothing before the @", { email: "@example.com", password: goodPassword }, BAD_EMAIL],
    // only spaces before the @: once trimmed, there's nothing before it. Proves the trim happens.
    ["only spaces before the @", { email: "   @example.com", password: goodPassword }, BAD_EMAIL],
    ["nothing after the @", { email: "shubh@", password: goodPassword }, BAD_EMAIL],
    ["no dot after the @", { email: "shubh@example", password: goodPassword }, BAD_EMAIL],
    // a dot exists, but only in the part before the @, so it doesn't count
    ["a dot, but only before the @", { email: "shubh.k@example", password: goodPassword }, BAD_EMAIL],

    // rule 2: the password
    ["no password", { email: goodEmail }, SHORT_PASSWORD],
    ["7 characters is too short", { email: goodEmail, password: "1234567" }, SHORT_PASSWORD],
    ["exactly 8 characters is fine", { email: goodEmail, password: "12345678" }, null],
    // the same 8 digits, but as a number instead of text: refused
    ["a password that is a number", { email: goodEmail, password: 12345678 }, SHORT_PASSWORD],

    // the order: when both are wrong, the email message comes first
    ["both wrong: the email comes first", { email: "shubh", password: "short" }, BAD_EMAIL]
];

for (const [label, body, expected] of cases) {
    report(label, validateCredentials(body), expected);
}

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);