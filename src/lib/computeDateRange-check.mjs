import { computeDateRange } from "./computeDateRange.js";

function fakeFund(name, schemeCode, rows) {
    return {
        name,
        schemeCode,
        data: {
            meta: { scheme_name: name },
            data: rows.map(([date, nav]) => ({ date, nav })),
            status: "SUCCESS"
        }
    };
}

const fundsData = [
    fakeFund("Fund A", 1, [["31-12-2025", "30"], ["01-06-2022", "20"], ["28-01-2020", "10"]]),
    fakeFund("Fund B (starts late)", 2, [["31-12-2025", "60"], ["01-01-2023", "45"], ["05-03-2021", "40"]]),
    fakeFund("Fund C (ends early)", 3, [["30-06-2025", "25"], ["01-01-2021", "15"], ["01-01-2019", "12"]])
];

const benchmarkData = fakeFund("Benchmark", 99, [["15-12-2025", "200"], ["01-06-2022", "150"], ["20-06-2019", "100"]]);

const result = computeDateRange(fundsData, benchmarkData);

console.log("expected: { start: '2021-03-05', end: '2025-06-30' }");
console.log("actual:  ", result);
console.log(result.start === "2021-03-05" && result.end === "2025-06-30" ? "PASS" : "FAIL");