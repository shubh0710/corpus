// Computes each day's "real" market return, with that day's own contribution
// removed first — so a deposit landing on a given day doesn't get mistaken for
// market growth in the return calculation.
export function computeCleanReturns(valueSeries, contributionSeries) {
    const result = [];

    // Start at day 1, not 0 — day 0 has no "yesterday" to compare against
    for (let i = 1; i < valueSeries.length; i++) {
        // Strip out today's fresh money first — this is what today's value
        // would have been if no new deposit had landed
        const cleanedValue = valueSeries[i].value - contributionSeries[i].amount;

        // Now compare that cleaned value to yesterday's actual value —
        // on a no-contribution day, amount is 0, so this naturally becomes
        // a plain return calculation with no extra branching needed
        const ret = (cleanedValue - valueSeries[i - 1].value) / valueSeries[i - 1].value;

        result.push({ date: valueSeries[i].date, return: ret });
    }

    return result;
}