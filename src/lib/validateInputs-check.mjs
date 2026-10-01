import { isDeepStrictEqual } from "node:util";
import { validateInputs } from "./validateInputs.js";

// One valid starting point. Every case below copies it and changes only
// what that case is about, so you can see at a glance what is "broken".
const range = { start: "2019-09-11", end: "2026-08-19" };

const goodShares = {
    118778: 25, 118989: 15, 118632: 20, 119028: 20, 119099: 10, 140088: 10 // adds up to 100
};

const goodPlan = {
    style: "sip",
    sipAmount: 5000,
    lumpsumAmount: 100000,
    rebalancing: "let_it_drift",
    from: "2021-01-01",
    to: "2025-01-01"
};

// Builds one input: the valid baseline with the given changes laid on top.
function makeInput({ shares = {}, plan = {} } = {}) {
    return { shares: { ...goodShares, ...shares }, plan: { ...goodPlan, ...plan }, range };
}

// The exact messages we expect, written out in full on purpose
const WHOLE = "Each share must be a whole number from 0 to 100 — fix any box with a decimal, a negative or a number above 100.";
const SIP_AMOUNT = "Enter the amount you'd invest each month — it must be above 0.";
const LUMP_AMOUNT = "Enter the amount you'd invest — it must be above 0.";
const FROM_EMPTY = "Pick a From date.";
const FROM_EARLY = "History only starts on 11 Sep 2019 — pick a From date on or after that.";
const FROM_LATE = "From must leave at least a year before the data ends on 19 Aug 2026 — pick an earlier From date.";
const TO_EMPTY = "Pick a To date.";
const TO_LATE = "History only goes up to 19 Aug 2026 — pick a To date on or before that.";

const cases = [
    // ---------- everything fine -> {} ----------
    ["fully valid input", makeInput(), {}],
    ["an empty share box is fine when the rest still total 100",
        makeInput({ shares: { 118778: "", 118989: 40 } }), {}],
    ["one fund at 100 and the rest at 0 is fine",
        makeInput({ shares: { 118778: 100, 118989: 0, 118632: 0, 119028: 0, 119099: 0, 140088: 0 } }), {}],
    ["From on the first data day and To on the last data day are both allowed",
        makeInput({ plan: { from: "2019-09-11", to: "2026-08-19" } }), {}],
    ["window of exactly 1 year passes",
        makeInput({ plan: { from: "2021-03-05", to: "2022-03-05" } }), {}],
    ["a window that ends exactly on the last data day passes (From 19 Aug 2025, To 19 Aug 2026)",
        makeInput({ plan: { from: "2025-08-19", to: "2026-08-19" } }), {}],
    ["window from a leap day: Feb 29 2020 + 1 year lands on Feb 28 2021, which passes",
        makeInput({ plan: { from: "2020-02-29", to: "2021-02-28" } }), {}],
    ["in SIP mode, a bad lump sum is ignored",
        makeInput({ plan: { style: "sip", lumpsumAmount: "" } }), {}],
    ["in Lump sum mode, a bad SIP amount is ignored",
        makeInput({ plan: { style: "lumpsum", sipAmount: 0 } }), {}],

    // ---------- shares ----------
    ["shares total 90",
        makeInput({ shares: { 118778: 15 } }),
        { shares: "Shares add up to 90% — they need to total 100%." }],
    ["shares total 110",
        makeInput({ shares: { 118778: 35 } }),
        { shares: "Shares add up to 110% — they need to total 100%." }],
    ["an empty box counts as 0, so the rest at 90 means a total of 90",
        makeInput({ shares: { 118778: "", 118989: 30 } }),
        { shares: "Shares add up to 90% — they need to total 100%." }],
    ["every box empty means a total of 0",
        makeInput({ shares: { 118778: "", 118989: "", 118632: "", 119028: "", 119099: "", 140088: "" } }),
        { shares: "Shares add up to 0% — they need to total 100%." }],
    ["a share of 12.5 is not a whole number",
        makeInput({ shares: { 118778: 12.5 } }),
        { shares: WHOLE }],
    ["a share of -5 is below 0",
        makeInput({ shares: { 118778: -5 } }),
        { shares: WHOLE }],
    ["a share of 101 is above 100",
        makeInput({ shares: { 118778: 101 } }),
        { shares: WHOLE }],
    ["a negative share is still reported as 'not whole 0-100' even when the total happens to be 100",
        makeInput({ shares: { 118778: -5, 118989: 45 } }),
        { shares: WHOLE }],

    // ---------- amount ----------
    ["SIP amount of 0",
        makeInput({ plan: { sipAmount: 0 } }), { amount: SIP_AMOUNT }],
    ["SIP amount empty",
        makeInput({ plan: { sipAmount: "" } }), { amount: SIP_AMOUNT }],
    ["SIP amount negative",
        makeInput({ plan: { sipAmount: -100 } }), { amount: SIP_AMOUNT }],
    ["SIP amount is Infinity (not a real number to invest)",
        makeInput({ plan: { sipAmount: Infinity } }), { amount: SIP_AMOUNT }],
    ["Lump sum mode: a bad lump sum fails even though the SIP amount is valid",
        makeInput({ plan: { style: "lumpsum", lumpsumAmount: 0 } }), { amount: LUMP_AMOUNT }],
    ["Lump sum mode: an empty lump sum fails",
        makeInput({ plan: { style: "lumpsum", lumpsumAmount: "" } }), { amount: LUMP_AMOUNT }],
    ["Lump sum mode: a negative lump sum fails",
        makeInput({ plan: { style: "lumpsum", lumpsumAmount: -1 } }), { amount: LUMP_AMOUNT }],

    // ---------- from ----------
    ["From is empty (To is fine, so only From is reported)",
        makeInput({ plan: { from: "" } }), { from: FROM_EMPTY }],
    ["From is the day before the data starts",
        makeInput({ plan: { from: "2019-09-10" } }), { from: FROM_EARLY }],
    // From has no room for a full year before the data ends, so the fix is an
    // earlier From (the To box can't go past the end). To says nothing about From.
    ["From 1 Jun 2026, To 19 Aug 2026 (the calendar allows both): only From is reported",
        makeInput({ plan: { from: "2026-06-01", to: "2026-08-19" } }), { from: FROM_LATE }],
    ["From 1 Dec 2026 (typed, after the data ends), To 19 Aug 2026: only From is reported",
        makeInput({ plan: { from: "2026-12-01", to: "2026-08-19" } }), { from: FROM_LATE }],
    ["boundary: From 20 Aug 2025 is one day too late for a full year",
        makeInput({ plan: { from: "2025-08-20", to: "2026-08-19" } }), { from: FROM_LATE }],

    // ---------- to ----------
    ["To is empty",
        makeInput({ plan: { to: "" } }), { to: TO_EMPTY }],
    ["To is the day after the data ends",
        makeInput({ plan: { to: "2026-08-20" } }), { to: TO_LATE }],
    ["To equals From (also under a year, but the 'after From' rule comes first and wins)",
        makeInput({ plan: { from: "2021-01-01", to: "2021-01-01" } }),
        { to: "To must be after 1 Jan 2021 — pick a later date." }],
    ["To is before From",
        makeInput({ plan: { from: "2021-01-01", to: "2020-06-15" } }),
        { to: "To must be after 1 Jan 2021 — pick a later date." }],
    ["window 1 day short of a year fails",
        makeInput({ plan: { from: "2021-03-05", to: "2022-03-04" } }),
        { to: "The window must be at least 1 year — pick a To date on or after 5 Mar 2022." }],
    ["window from a leap day, 1 day short of Feb 28 2021, fails",
        makeInput({ plan: { from: "2020-02-29", to: "2021-02-27" } }),
        { to: "The window must be at least 1 year — pick a To date on or after 28 Feb 2021." }],

    // ---------- more than one thing broken ----------
    ["From too late and To empty: To still reports its own problem",
        makeInput({ plan: { from: "2026-06-01", to: "" } }),
        { from: FROM_LATE, to: TO_EMPTY }],
    ["From too late and To after the data end: each is reported for itself",
        makeInput({ plan: { from: "2026-08-19", to: "2026-08-25" } }),
        { from: FROM_LATE, to: TO_LATE }],
    ["shares and amount both broken",
        makeInput({ shares: { 118778: 15 }, plan: { sipAmount: 0 } }),
        { shares: "Shares add up to 90% — they need to total 100%.", amount: SIP_AMOUNT }],
    ["From and To both empty",
        makeInput({ plan: { from: "", to: "" } }),
        { from: FROM_EMPTY, to: TO_EMPTY }],
    ["From too early and To too late",
        makeInput({ plan: { from: "2019-01-01", to: "2027-01-01" } }),
        { from: FROM_EARLY, to: TO_LATE }],
    ["all four broken at once",
        makeInput({ shares: { 118778: 15 }, plan: { sipAmount: "", from: "", to: "" } }),
        { shares: "Shares add up to 90% — they need to total 100%.", amount: SIP_AMOUNT, from: FROM_EMPTY, to: TO_EMPTY }]
];

let failures = 0;

for (const [name, input, expected] of cases) {
    const actual = validateInputs(input);
    // isDeepStrictEqual compares whole objects (and ignores the order of the keys)
    const passed = isDeepStrictEqual(actual, expected);
    if (!passed) failures++;
    console.log(passed ? "PASS" : "FAIL", "-", name);
    if (!passed) {
        console.log("   expected:", JSON.stringify(expected));
        console.log("   actual:  ", JSON.stringify(actual));
    }
}

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);