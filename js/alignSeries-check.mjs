import { readFileSync } from 'fs';
import { formatNavData } from './formatNavData.js'
import { alignSeries } from './alignSeries.js';

const fundRaw = JSON.parse(readFileSync('./fixtures/sample-nav.json', 'utf-8'));
const benchmarkRaw = JSON.parse(readFileSync('./fixtures/sample-benchmark.json', 'utf-8'));

const fundHistory = formatNavData(fundRaw);
const benchmarkHistory = formatNavData(benchmarkRaw);

const [alignedFund, alignedBenchmark] = alignSeries(fundHistory, benchmarkHistory);

console.log('fund:      ', alignedFund[0].date, '->', alignedFund.at(-1).date, ' rows:', alignedFund.length);
console.log('benchmark: ', alignedBenchmark[0].date, '->', alignedBenchmark.at(-1).date, ' rows:', alignedBenchmark.length);
console.log('row counts match:', alignedFund.length === alignedBenchmark.length);