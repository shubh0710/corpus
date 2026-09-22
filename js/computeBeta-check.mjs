import { computeBeta } from "./computeBeta.js"

//Sample data for now
const benchmarkReturns = [
    { date: "d1", return: 0.01 }, { date: "d2", return: -0.02 }, { date: "d3", return: 0.03 },
    { date: "d4", return: -0.01 }, { date: "d5", return: 0.02 },
];
const mixReturns = [
    { date: "d1", return: 0.015 }, { date: "d2", return: -0.03 }, { date: "d3", return: 0.045 },
    { date: "d4", return: -0.015 }, { date: "d5", return: 0.03 },
];

// --- run it ---
console.log(computeBeta(mixReturns, benchmarkReturns));