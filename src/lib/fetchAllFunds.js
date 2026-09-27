import { BENCHMARK, FUNDS } from "./funds.js";
import { fetchFundData } from "./fetchNavData.js"

export async function fetchAllFundsData() {
    // Calling fetchFundData() WITHOUT await starts the network request immediately,
    // but doesn't pause to wait — you get back a Promise (a placeholder), instantly.
    // .map() does this once per fund → 6 requests all fire in the same instant.
    const fundPromises = FUNDS.map(fund => fetchFundData(fund.schemeCode));

    // Same idea for the benchmark — starts firing right here, at the same moment
    // as the 6 fund requests above, not after them.
    const benchmarkPromise = fetchFundData(BENCHMARK.schemeCode);

    // Promise.all() takes a list of Promises and waits for ALL of them to finish,
    // together — not one after another. Since fundPromises and benchmarkPromise
    // were already "in flight" by the time we reach this line, wrapping them here
    // doesn't delay anything — it just waits for whichever one finishes last.
    const [fundResults, benchmarkResult] = await Promise.all([
        Promise.all(fundPromises), // waits for all 6 fund fetches together
        benchmarkPromise,          // waits for the benchmark fetch too, same moment
    ]);

    // fundResults is now an array of 6 raw API responses, in the SAME ORDER as
    // FUNDS — Promise.all guarantees this, even though the requests finished at
    // different real-world times. That's what lets us safely pair FUNDS[i] with
    // fundResults[i] below.
    const fundsData = FUNDS.map((fund, i) => ({
        name: fund.name,
        schemeCode: fund.schemeCode,
        data: fundResults[i],
    }));

    const benchmarkData = {
        name: BENCHMARK.name,
        schemeCode: BENCHMARK.schemeCode,
        data: benchmarkResult,
    };

    return { fundsData, benchmarkData };
}