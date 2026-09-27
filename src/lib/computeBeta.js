// Beta measures how much a portfolio tends to move relative to a benchmark —
// does it swing more, less, or exactly in step with the market?
export function computeBeta(mixReturns, benchmarkReturns) {
    // Average daily return for each series — the "center point" everything else measures distance from
    const meanMix = mixReturns.reduce((sum, r) => sum + r.return, 0) / mixReturns.length;
    const meanBenchmark = benchmarkReturns.reduce((sum, r) => sum + r.return, 0) / benchmarkReturns.length;

    let covarianceSum = 0; // tracks whether mix and benchmark move together, day by day
    let varianceSum = 0;   // tracks how much the benchmark alone wanders from its own average

    // Both arrays are the same length with matching dates, so we can walk them
    // together in one loop instead of two separate passes
    for (let i = 0; i < mixReturns.length; i++) {
        const mixDiff = mixReturns[i].return - meanMix;                    // today's mix return vs its own average
        const benchmarkDiff = benchmarkReturns[i].return - meanBenchmark;  // today's benchmark return vs its own average

        // If both are above (or both below) their averages on the same day, this
        // product is positive — a sign they're moving together
        covarianceSum += mixDiff * benchmarkDiff;

        // How spread out the benchmark's own returns are — this becomes beta's denominator
        varianceSum += benchmarkDiff * benchmarkDiff;
    }

    // Calculating beta
    const beta = covarianceSum / varianceSum;

    return beta;
}