import { formatRupees, formatPercent, formatCompactRupees } from "./formatNumbers.js";

// Each case is [the number we give it, the text we expect back]
const rupeeCases = [
    // the three examples from the ticket
    [415000, "₹4,15,000"],
    [802400.37, "₹8,02,400"],
    [5000, "₹5,000"],

    // whole rupees are rounded, not chopped: .62 goes up
    [802400.62, "₹8,02,401"],

    // Indian commas: the last three digits, then pairs (lakhs, crores)
    [100000, "₹1,00,000"],
    [12345678, "₹1,23,45,678"],

    // small numbers
    [999, "₹999"],
    [0, "₹0"]
];

// Each case is [the number we give it, the text we expect back].
// We give no second number, so these use the default of 1 decimal.
// The minus signs below are the true minus sign (−), not the keyboard hyphen (-).
const percentCases = [
    [0.184, "18.4%"],
    [-0.246, "−24.6%"],
    [0.2646, "26.5%"],   // rounded, not chopped (26.46 becomes 26.5)
    [0.3, "30.0%"],      // the zero is kept, so columns line up
    [0, "0.0%"],
    [0.071, "7.1%"]
];

// Each case is [the number, how many decimals, the text we expect back]
const percentDecimalsCases = [
    [0.1429, 0, "14%"],
    [-0.1429, 0, "−14%"],
    [0.1429, 2, "14.29%"],
    [0.184, 1, "18.4%"]   // saying 1 out loud is the same as the default
];

// Each case is [the number we give it, the text we expect back].
// The short form for the chart's axis: K = thousand, L = lakh (1,00,000), Cr = crore (1,00,00,000).
const compactCases = [
    [0, "₹0"],            // zero has no unit
    [80000, "₹80K"],      // under a lakh: thousands
    [160000, "₹1.6L"],    // a lakh or more: lakhs, one decimal
    [250000, "₹2.5L"],
    [300000, "₹3L"],      // a whole number shows no ".0"
    [9000000, "₹90L"],    // still lakhs: it is under a crore
    [12000000, "₹1.2Cr"], // a crore or more: crores

    // Added after the sabotage test: the seven above never land exactly on a unit's edge,
    // and none of them needs a second digit to be rounded away.
    [100000, "₹1L"],      // exactly one lakh is a lakh, not "₹100K" (this is what >= is for)
    [10000000, "₹1Cr"],   // exactly one crore is a crore, not "₹100L"
    [1267000, "₹12.7L"]   // 12.67 is rounded to 12.7, not chopped to 12.6 and not left as 12.67
];

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

for (const [amount, expected] of rupeeCases) {
    report("formatRupees " + amount, formatRupees(amount), expected);
}

for (const [value, expected] of percentCases) {
    report("formatPercent " + value, formatPercent(value), expected);
}

for (const [value, decimals, expected] of percentDecimalsCases) {
    report(`formatPercent ${value}, ${decimals} decimals`, formatPercent(value, decimals), expected);
}

for (const [amount, expected] of compactCases) {
    report("formatCompactRupees " + amount, formatCompactRupees(amount), expected);
}

// The two minus signs look almost the same, so we check the character itself:
// the true minus sign is character number 8722, the keyboard hyphen is 45.
report("first character of formatPercent -0.246", formatPercent(-0.246).charCodeAt(0), 8722);

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);