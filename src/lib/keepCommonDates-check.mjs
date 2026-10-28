// Checks keepCommonDates.js. Run it from the project root:   node src/lib/keepCommonDates-check.mjs
import { keepCommonDates } from "./keepCommonDates.js";

let failures = 0;

function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

function dates(history) {
    return history.map(row => row.date).join(", ");
}

const a = [{ date: "2024-01-01", price: 1 }, { date: "2024-01-02", price: 2 }, { date: "2024-01-03", price: 3 }, { date: "2024-01-04", price: 4 }];
const b = [{ date: "2024-01-01", price: 5 }, { date: "2024-01-03", price: 6 }, { date: "2024-01-04", price: 7 }];
const c = [{ date: "2024-01-01", price: 8 }, { date: "2024-01-02", price: 9 }, { date: "2024-01-04", price: 10 }];

const [keptA, keptB, keptC] = keepCommonDates([a, b, c]);
report("only the dates all three share", dates(keptA), "2024-01-01, 2024-01-04");
report("same dates in the second list", dates(keptB), "2024-01-01, 2024-01-04");
report("same dates in the third list", dates(keptC), "2024-01-01, 2024-01-04");
report("each list keeps its own prices", keptB.map(row => row.price).join(", "), "5, 7");

const [sameA, sameB] = keepCommonDates([a, a]);
report("identical dates: nothing removed", dates(sameA), dates(a));
report("identical dates: second list too", sameB.length, a.length);

report("originals not changed", b.length, 3);

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);