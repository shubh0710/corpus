import { readFileSync } from 'fs';
import { computeSipSeries, loadNavData } from './sipCalc.js';

// --- run it ---
const rawJson = JSON.parse(readFileSync('./fixtures/sample-nav.json', 'utf-8'));
const navHistory = loadNavData(rawJson);

console.log(computeSipSeries(navHistory, 5, 1000))