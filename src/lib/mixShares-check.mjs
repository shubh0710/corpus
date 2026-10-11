// Checks mixShares.js: turning the page's shares object into the list the server wants, and back.
// Run it from the project root:   node src/lib/mixShares-check.mjs
import { sharesToList, listToShares } from "./mixShares.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// A small hand-made mix, shaped like the page keeps it: scheme code -> share
const shares = { 118778: 25, 118989: 75 };
// The same mix, shaped like the server wants it: a list, with each scheme code as a NUMBER
const list = [
    { schemeCode: 118778, share: 25 },
    { schemeCode: 118989, share: 75 }
];

// ---- sharesToList ----
const made = sharesToList(shares);
report("sharesToList: 2 entries", made.length, 2);
// An object's keys are always text, so the code must be turned back into a number.
// typeof says "number" for 118778 and "string" for "118778".
report("sharesToList: schemeCode is a number", typeof made[0].schemeCode, "number");
report("sharesToList: share kept", made[0].share, 25);
// Two lists can't be compared with === (that asks "the very same list?"), so turn both
// into JSON text and compare the text
report("sharesToList: the whole list", JSON.stringify(made), JSON.stringify(list));

// ---- listToShares ----
report("listToShares: back to the object", JSON.stringify(listToShares(list)), JSON.stringify(shares));

// ---- round trip: there and back gives what we started with ----
report("round trip", JSON.stringify(listToShares(sharesToList(shares))), JSON.stringify(shares));

// ---- an empty box stays empty: no "fixing" it here; the server answers with its own message ----
report("an empty box is sent as \"\"", JSON.stringify(sharesToList({ 118778: "" })), JSON.stringify([{ schemeCode: 118778, share: "" }]));

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);