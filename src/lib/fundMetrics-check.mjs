// Checks fundMetrics.js. Run it from the project root:   node src/lib/fundMetrics-check.mjs
import { readFileSync } from "fs";
import { formatNavData } from "./formatNavData.js";
import { computeFundMetrics } from "./fundMetrics.js";

let failures = 0;

function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

function reportClose(label, actual, expected, tolerance = 1e-9) {
    const passed = Math.abs(actual - expected) < tolerance;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// ---- worst fall and its date, by hand: up to 120, down to 90 (-25%), back up ----
const hand = computeFundMetrics([
    { date: "2024-01-01", price: 100 },
    { date: "2024-04-01", price: 120 },
    { date: "2024-07-01", price: 90 },
    { date: "2024-10-01", price: 110 },
    { date: "2025-01-01", price: 130 }
]);
reportClose("worst fall: 120 down to 90 is 25%", hand.maxDrawdown, 0.25);
report("worst fall's bottom date", hand.troughDate, "2024-07-01");

// ---- CAGR: doubling in exactly 365 days is +100% a year ----
const doubling = computeFundMetrics([
    { date: "2023-01-01", price: 50 },
    { date: "2023-07-01", price: 70 },
    { date: "2024-01-01", price: 100 }
]);
reportClose("doubling in a year is 100% CAGR", doubling.cagr, 1);

// ---- a line that only rises never falls ----
report("only rising: no worst fall", doubling.maxDrawdown, 0);

// ---- a flat price has no bumpiness ----
const flat = computeFundMetrics([
    { date: "2024-01-01", price: 10 },
    { date: "2024-01-02", price: 10 },
    { date: "2024-01-03", price: 10 }
]);
report("flat price: zero risk", flat.risk, 0);

// ---- real data (Nippon India Small Cap from the fixture): numbers in a sensible range ----
const real = computeFundMetrics(formatNavData(JSON.parse(readFileSync("./fixtures/sample-nav.json", "utf-8"))));
report("real fund: risk between 10% and 40% a year", real.risk > 0.1 && real.risk < 0.4, true);
report("real fund: worst fall between 20% and 70%", real.maxDrawdown > 0.2 && real.maxDrawdown < 0.7, true);
report("real fund: worst fall bottomed in the 2020 crash", real.troughDate.slice(0, 7), "2020-03");

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);