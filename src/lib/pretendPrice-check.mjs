// Checks pretendPrice.js. Run it from the project root:   node src/lib/pretendPrice-check.mjs
import { computePretendPrice } from "./pretendPrice.js";

let failures = 0;

function reportClose(label, actual, expected) {
    const passed = Math.abs(actual - expected) < 1e-9;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// The hand example: 1000 grows to 1100 (+10%), then 1000 more goes in and the balance is 2200.
// Of that 2200, 1000 is new money, so the real gain on day 3 is 1200 vs 1100: +9.09%.
const values = [
    { date: "2024-01-01", value: 1000 },
    { date: "2024-01-02", value: 1100 },
    { date: "2024-01-03", value: 2200 }
];
const money = [
    { date: "2024-01-01", amount: 1000 },
    { date: "2024-01-02", amount: 0 },
    { date: "2024-01-03", amount: 1000 }
];
const pretend = computePretendPrice(values, money);
reportClose("starts at 100", pretend[0].price, 100);
reportClose("+10% on day 2", pretend[1].price, 110);
reportClose("the deposit isn't counted as a gain", pretend[2].price, 120);

// With no deposits after day 1 (a lump sum), the pretend price is just the balance scaled to 100
const lump = [{ date: "d1", value: 5000 }, { date: "d2", value: 4000 }, { date: "d3", value: 6000 }];
const noMoney = [{ date: "d1", amount: 5000 }, { date: "d2", amount: 0 }, { date: "d3", amount: 0 }];
const lumpPretend = computePretendPrice(lump, noMoney);
reportClose("lump sum: value / first x 100 (day 2)", lumpPretend[1].price, 80);
reportClose("lump sum: value / first x 100 (day 3)", lumpPretend[2].price, 120);

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);