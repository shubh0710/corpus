import { readFileSync } from 'fs';
import { computeSipSeries } from './sipCalc.js';
import { formatNavData } from './formatNavData.js';

// --- run it ---
const rawJson = JSON.parse(readFileSync('./fixtures/sample-nav.json', 'utf-8'));
const navHistory = formatNavData(rawJson);

console.log(computeSipSeries(navHistory, 5, 1000))