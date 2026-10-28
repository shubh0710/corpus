import { computeCleanReturns } from "./computeCleanReturns.js";

// A SIP balance jumps up every month just because new money goes in, so a balance can't be
// used to measure bumpiness or the worst fall: a deposit would look like a gain. The "pretend
// price" fixes that. It's the price ONE unit of your mix would have, if your mix were a fund:
// it starts at 100 and moves only by the day's real gain or loss, with the deposits taken out
// (computeCleanReturns does the taking out). Fund houses use the same idea for a fund's NAV.
//
// valueSeries:        [{ date, value }], the balance every day.
// contributionSeries: [{ date, amount }], the money put in that day (0 on most days).
// Returns [{ date, price }], the same shape as a fund's prices, so computeFundMetrics can read it.
export function computePretendPrice(valueSeries, contributionSeries) {
    const returns = computeCleanReturns(valueSeries, contributionSeries);

    const result = [{ date: valueSeries[0].date, price: 100 }];
    for (const day of returns) {
        // Today's price is yesterday's, grown by today's clean return (0.1 means +10%)
        const yesterday = result.at(-1).price;
        result.push({ date: day.date, price: yesterday * (1 + day.return) });
    }
    return result;
}