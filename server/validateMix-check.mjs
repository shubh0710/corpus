// Checks validateMix: the guard's checklist for a mix someone wants to save.
// No server, no database. Run it from inside server/:   node validateMix-check.mjs
import { validateMix } from "./validateMix.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// The messages we expect, written once
const NO_NAME = "Give the mix a name.";
const NO_FUNDS = "Add at least one fund.";
const NO_CODE = "Each fund needs a scheme code.";
const BAD_SHARE = "Each share must be a whole number from 0 to 100 — fix any box with a decimal, a negative or a number above 100.";

// A mix that follows every rule. The cases below change one thing at a time.
const goodShares = [
    { schemeCode: 118778, share: 60 },
    { schemeCode: 140088, share: 40 }
];

// Each case is [what we're testing, the body that arrives, the answer we expect]
const cases = [
    ["a good mix", { name: "My mix", shares: goodShares }, null],
    ["spaces around the name are fine", { name: "  My mix  ", shares: goodShares }, null],

    // rule 1: the name
    ["no name", { shares: goodShares }, NO_NAME],
    ["a name of only spaces", { name: "   ", shares: goodShares }, NO_NAME],
    ["a name that is a number", { name: 42, shares: goodShares }, NO_NAME],

    // rule 2: the list of funds
    ["no shares", { name: "My mix" }, NO_FUNDS],
    ["an empty list of shares", { name: "My mix", shares: [] }, NO_FUNDS],
    // the page's own shape: an object keyed by scheme code, not a list. Easy to send by mistake.
    ["shares sent as the page's object", { name: "My mix", shares: { 118778: 60, 140088: 40 } }, NO_FUNDS],

    // rule 3: every fund has a scheme code (a number)
    ["a fund with no scheme code", { name: "My mix", shares: [{ share: 60 }, { schemeCode: 140088, share: 40 }] }, NO_CODE],
    ["a scheme code sent as text", { name: "My mix", shares: [{ schemeCode: "118778", share: 60 }, { schemeCode: 140088, share: 40 }] }, NO_CODE],

    // rule 4: whole numbers from 0 to 100. Each case still totals 100, so only this rule can catch it.
    ["a share of 2.5", { name: "My mix", shares: [{ schemeCode: 118778, share: 2.5 }, { schemeCode: 140088, share: 97.5 }] }, BAD_SHARE],
    ["a share of -10", { name: "My mix", shares: [{ schemeCode: 118778, share: -10 }, { schemeCode: 140088, share: 60 }, { schemeCode: 119028, share: 50 }] }, BAD_SHARE],
    ["a share of 150", { name: "My mix", shares: [{ schemeCode: 118778, share: 150 }] }, BAD_SHARE],
    ["the edges 0 and 100 are allowed", { name: "My mix", shares: [{ schemeCode: 118778, share: 0 }, { schemeCode: 140088, share: 100 }] }, null],

    // rule 5: the total
    ["a total of 90", { name: "My mix", shares: [{ schemeCode: 118778, share: 50 }, { schemeCode: 140088, share: 40 }] }, "Shares add up to 90% — they need to total 100%."],
    ["a total of 110", { name: "My mix", shares: [{ schemeCode: 118778, share: 70 }, { schemeCode: 140088, share: 40 }] }, "Shares add up to 110% — they need to total 100%."],

    // the order: when several rules are broken, the first one in the list wins
    ["no name AND no funds: the name comes first", { name: "", shares: [] }, NO_NAME]
];

for (const [label, body, expected] of cases) {
    report(label, validateMix(body), expected);
}

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);