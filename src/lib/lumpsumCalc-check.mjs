import { readFileSync } from "fs";
import { formatNavData } from "./formatNavData.js";
import { computeLumpsumSeries } from "./lumpsumCalc.js";

const amount = 6000

// --- run it ---
const rawJson = JSON.parse(readFileSync('./fixtures/sample-nav.json', 'utf-8'));
const navHistory = formatNavData(rawJson);

console.log(computeLumpsumSeries(navHistory, amount));