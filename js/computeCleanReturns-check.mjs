import { computeCleanReturns } from "./computeCleanReturns.js";

const valueSeries = [
    { date: "2024-01-01", value: 1000 }, { date: "2024-01-02", value: 1010 },
    { date: "2024-02-05", value: 2030 }, { date: "2024-02-06", value: 2040 },
];
const contributionSeries = [
    { date: "2024-01-01", amount: 0 }, { date: "2024-01-02", amount: 0 },
    { date: "2024-02-05", amount: 1000 }, { date: "2024-02-06", amount: 0 },
];

console.log(computeCleanReturns(valueSeries, contributionSeries));