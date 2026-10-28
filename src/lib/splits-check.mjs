// Checks splits.js. Run it from the project root:   node src/lib/splits-check.mjs
import { SPLITS, adjustForSplits } from "./splits.js";

let failures = 0;

function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// Just the prices, joined into one line of text, so a whole list can be compared at once
function prices(history) {
    return history.map(row => row.price).join(", ");
}

// A 100-for-1 split on day 3: the price falls from 3400 to 34 overnight, but no money was lost
const history = [
    { date: "2019-12-19", price: 3300 },
    { date: "2019-12-20", price: 3400 },
    { date: "2019-12-23", price: 34 },
    { date: "2019-12-24", price: 35 }
];
const split = [{ date: "2019-12-23", ratio: 100 }];

report("prices before the split are divided by the ratio", prices(adjustForSplits(history, split)), "33, 34, 34, 35");
report("no splits leaves the prices alone", prices(adjustForSplits(history)), "3300, 3400, 34, 35");
report("the dates stay the same", adjustForSplits(history, split).map(row => row.date).join(", "),
    "2019-12-19, 2019-12-20, 2019-12-23, 2019-12-24");

adjustForSplits(history, split);
report("original not changed", prices(history), "3300, 3400, 34, 35");

report("Gold BeES has its split listed", SPLITS[140088].length, 1);
report("other funds have none", SPLITS[118778], undefined);

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);