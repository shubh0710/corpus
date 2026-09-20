import { readFileSync } from 'fs';
import { formatNavData } from './formatNavData.js';
import { computeSipSeries } from './sipCalc.js';
import { computeFundMetrics } from "./fundMetrics.js";
import { computeXIRR } from './xirrCalc.js';

const sipDate = 5;
const sipAmount = 1000;

const rawJson = JSON.parse(readFileSync('./fixtures/sample-benchmark.json', 'utf-8'));
const navHistory = formatNavData(rawJson);

const sipResult = computeSipSeries(navHistory, sipDate, sipAmount);
console.log(computeFundMetrics(navHistory))

// XIRR needs a list of cashflows: money going out (investments) and money coming in (payout).
// Every day we actually contributed becomes an "outflow" — negative, since it's money leaving your pocket.
const outflows = sipResult
    .filter(row => row.contributed)                         // keep only the days a purchase happened
    .map(row => ({ date: row.date, amount: -sipAmount }))   // rebuild as {date, amount}, negative = money out

// The final day's holding value becomes the one "inflow" — what you'd get back if you sold everything today   
const lastRow = sipResult[sipResult.length - 1];
const inflow = { date: lastRow.date, amount: lastRow.value };

// Combine into one flat, date-ordered list: all outflows first, inflow last (same date as the last outflow)
const cashflows = [...outflows, inflow];

// --- run it ---
console.log(computeXIRR(cashflows));