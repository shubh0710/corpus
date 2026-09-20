import { mergeFundSeries } from "./mergeFundSeries.js";

const fundSeriesList = [
    [{ date: "2024-01-01", value: 1000 }, { date: "2024-01-08", value: 1050 }, { date: "2024-01-15", value: 1030 }],
    [{ date: "2024-01-08", value: 500 }, { date: "2024-01-15", value: 520 }],
];

// --- run it ---
console.log(mergeFundSeries(fundSeriesList));