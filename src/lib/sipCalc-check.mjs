// Checks sipCalc.js. Run it from the project root:   node src/lib/sipCalc-check.mjs
import { computeSipSeries } from "./sipCalc.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// Money maths gives answers like 0.30000000000000004 instead of 0.3, so numbers are
// checked as "close enough": the gap must be smaller than a tiny amount.
function reportClose(label, actual, expected) {
    const passed = Math.abs(actual - expected) < 1e-9;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// A price list with every weekday from `start` to `end` (weekends left out, like the real
// data), each at the given price. getUTCDay() gives 0 for Sunday and 6 for Saturday.
function weekdays(start, end, price) {
    const rows = [];
    for (let day = new Date(`${start}T00:00:00Z`); day <= new Date(`${end}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + 1)) {
        const weekday = day.getUTCDay();
        if (weekday !== 0 && weekday !== 6) {
            rows.push({ date: day.toISOString().slice(0, 10), price });
        }
    }
    return rows;
}

function depositDays(series) {
    return series.filter(row => row.contributed).map(row => row.date).join(", ");
}

// ---- the bug this file fixes: 28 Feb 2021 was a Sunday ----
const feb2021 = computeSipSeries(weekdays("2021-01-28", "2021-04-30", 10), 28, 1000);
report("holiday SIP is paid next trading day, never skipped", depositDays(feb2021),
    "2021-01-28, 2021-03-01, 2021-03-29, 2021-04-28");

// ---- an ordinary month: due on the 10th, paid on the 10th or the next weekday ----
const ordinary = computeSipSeries(weekdays("2024-01-10", "2024-04-09", 10), 10, 1000);
report("one instalment a month", depositDays(ordinary), "2024-01-10, 2024-02-12, 2024-03-11");

// ---- the first instalment, and the running totals ----
const first = feb2021[0];
report("day one is always a deposit", first.contributed, true);
reportClose("1000 at price 10 buys 100 units", first.units, 100);
report("invested after four instalments", feb2021.at(-1).invested, 4000);
reportClose("value = units x price", feb2021.at(-1).value, 4000);

// ---- prices move: more units when cheap ----
const moving = computeSipSeries([
    { date: "2024-01-01", price: 10 },
    { date: "2024-02-01", price: 20 }
], 1, 1000);
reportClose("units add up across instalments", moving[1].units, 100 + 50);
reportClose("value uses today's price", moving[1].value, 150 * 20);

// ---- From on a holiday: first instalment paid on the next trading day, the rest stay on time ----
// From was Saturday 30 Jan 2021 (SIP day capped at 28). Paid Mon 1 Feb; Feb's own instalment
// is due on 28 Feb (a Sunday), so it's paid Mon 1 Mar; March's on Mon 29 Mar.
const fromOnHoliday = computeSipSeries(weekdays("2021-02-01", "2021-03-31", 10), 28, 1000, "2021-01-30");
report("From on a holiday keeps the schedule", depositDays(fromOnHoliday), "2021-02-01, 2021-03-01, 2021-03-29");

// ---- the original list is left alone ----
const original = [{ date: "2024-01-01", price: 10 }];
computeSipSeries(original, 1, 1000);
report("original not changed", JSON.stringify(original), JSON.stringify([{ date: "2024-01-01", price: 10 }]));

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);