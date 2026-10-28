// Checks fetchAllFunds.js with a stand-in for fetch, so it runs without a server or internet.
// Run it from the project root:   node src/lib/fetchAllFunds-check.mjs
import { fetchAllFundsData } from "./fetchAllFunds.js";
import { FUNDS, BENCHMARK } from "./funds.js";

let failures = 0;

function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// Each answer says which fund it is, so we can check every fund got its own prices back
const calls = [];
globalThis.fetch = async url => {
    calls.push(url);
    const code = Number(url.split("/").pop());
    return { ok: true, status: 200, json: async () => ({ meta: { scheme_code: code }, data: [] }) };
};

const result = await fetchAllFundsData();
report("seven requests (six funds and the benchmark)", calls.length, 7);
report("all to our own server", calls.every(url => url.startsWith("/api/nav/")), true);
report("six funds, in FUNDS order", result.fundsData.map(f => f.schemeCode).join(","), FUNDS.map(f => f.schemeCode).join(","));
report("each fund got its own prices", result.fundsData.every(f => f.data.meta.scheme_code === f.schemeCode), true);
report("the benchmark too", result.benchmarkData.data.meta.scheme_code, BENCHMARK.schemeCode);

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);