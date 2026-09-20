import { readFileSync } from 'fs';
import { computeSipSeries } from './sipCalc.js';
import { formatNavData } from './formatNavData.js';

const sipDate = 5;
const sipAmount = 1000;

// --- run it ---
const rawJson = JSON.parse(readFileSync('./fixtures/sample-nav.json', 'utf-8'));
const navHistory = formatNavData(rawJson);

console.log(computeSipSeries(navHistory, sipDate, sipAmount));