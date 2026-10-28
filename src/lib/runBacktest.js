import { FUNDS } from "./funds.js";
import { formatNavData } from "./formatNavData.js";
import { SPLITS, adjustForSplits } from "./splits.js";
import { keepCommonDates } from "./keepCommonDates.js";
import { computeSipSeries } from "./sipCalc.js";
import { computeLumpsumSeries } from "./lumpsumCalc.js";
import { mergeFundSeries } from "./mergeFundSeries.js";
import { computeXIRR } from "./xirrCalc.js";
import { computePretendPrice } from "./pretendPrice.js";
import { computeCleanReturns } from "./computeCleanReturns.js";
import { computeFundMetrics } from "./fundMetrics.js";
import { computeBeta } from "./computeBeta.js";

// The whole backtest in one call: replays the person's plan on the real prices and gives
// back everything Cards 3 and 4 show, in exactly the shape they read.
//
//   fundsData, benchmarkData - the raw price lists, as fetchAllFundsData returns them
//   shares                   - the page's shares, { 118778: 25, ... } (an empty box counts as 0)
//   plan                     - the page's plan: style, sipAmount, lumpsumAmount, rebalancing, from, to
//
// The steps, in order:
//   1. tidy each price list (dates, numbers, splits undone) and cut it to From..To
//   2. keep only the days every fund AND the benchmark have, so all are measured alike
//   3. grow each fund's share of the money, and add the funds up into the mix
//   4. grow the full amount in the benchmark the same way
//   5. measure both: yearly return, bumpiness, worst fall, beta
//   6. measure each fund on its own
export function runBacktest({ fundsData, benchmarkData, shares, plan }) {
    // The page stops this choice before it gets here (validateInputs), but the engine says
    // so clearly too, in case anything ever calls it directly
    if (plan.rebalancing === "rebalance_yearly") {
        throw new Error("Yearly rebalancing isn't built yet.");
    }

    const isSip = plan.style === "sip";
    const amount = isSip ? plan.sipAmount : plan.lumpsumAmount;
    // The SIP is due on From's day of the month. Not every month has a 29th, 30th or 31st,
    // so like most fund houses we cap it at the 28th.
    const sipDay = Math.min(Number(plan.from.slice(8, 10)), 28);

    // ---- 1. tidy and cut ----
    // SPLITS[schemeCode] is undefined for funds without a split, and adjustForSplits then
    // uses its default (no splits)
    function prepare(item) {
        const history = adjustForSplits(formatNavData(item.data), SPLITS[item.schemeCode]);
        return history.filter(row => row.date >= plan.from && row.date <= plan.to);
    }
    const fundWindows = fundsData.map(prepare);
    const benchmarkWindow = prepare(benchmarkData);

    // ---- 2. the shared days ----
    // The benchmark goes in last, so it comes back last; slice(0, -1) is everything but the last
    const common = keepCommonDates([...fundWindows, benchmarkWindow]);
    const fundDays = common.slice(0, -1);
    const benchmarkDays = common.at(-1);

    // One way to grow money on a price list, used for every fund and the benchmark
    function grow(history, money) {
        return isSip
            ? computeSipSeries(history, sipDay, money, plan.from)
            : computeLumpsumSeries(history, money);
    }

    // ---- 3. the mix ----
    // Each fund gets its share of every instalment: 25% of 5000 is 1250. Number("") is 0,
    // so an empty box simply means no money in that fund.
    const fundBalances = fundsData.map((item, i) => {
        const share = Number(shares[item.schemeCode]);
        return grow(fundDays[i], amount * share / 100);
    });
    const mixSeries = mergeFundSeries(fundBalances);

    // ---- 4. the benchmark ----
    // The same money, on the same days. Its rows are { date, value, ... }; the chart wants
    // { date, total } like the mix, so each row is reshaped.
    const benchmarkBalance = grow(benchmarkDays, amount);
    const benchmarkSeries = benchmarkBalance.map(row => ({ date: row.date, total: row.value }));

    // The money put in on each day (0 on most days). Every fund and the benchmark deposit on
    // the same days, so the benchmark's record tells us for the mix too.
    const deposits = benchmarkBalance.map(row => ({ date: row.date, amount: row.contributed ? amount : 0 }));
    const invested = benchmarkBalance.at(-1).invested;

    // ---- 5. measure ----
    const mixMeasures = measure(mixSeries, deposits);
    const benchmarkMeasures = measure(benchmarkSeries, deposits);

    const mix = {
        series: mixSeries,
        finalValue: mixSeries.at(-1).total,
        annualReturn: mixMeasures.annualReturn,
        risk: mixMeasures.risk,
        worstFall: mixMeasures.worstFall,
        // Beta: how much the mix tends to move when the market (the benchmark) moves 1%.
        // Both are measured on their clean daily returns, deposits taken out.
        beta: computeBeta(
            computeCleanReturns(toValues(mixSeries), deposits),
            computeCleanReturns(toValues(benchmarkSeries), deposits)
        )
    };

    const benchmark = {
        series: benchmarkSeries,
        finalValue: benchmarkSeries.at(-1).total,
        annualReturn: benchmarkMeasures.annualReturn,
        risk: benchmarkMeasures.risk,
        worstFall: benchmarkMeasures.worstFall,
        // The bottom of the benchmark's worst fall: the chart draws a line on this day
        worstFallDate: benchmarkMeasures.worstFallDate
    };

    // ---- 6. each fund on its own ----
    // Measured on its own window (step 1), not the shared days: one fund's missing day
    // shouldn't change another fund's numbers. Same order as FUNDS.
    const funds = fundsData.map((item, i) => {
        const metrics = computeFundMetrics(fundWindows[i]);
        const fund = FUNDS.find(f => f.schemeCode === item.schemeCode);
        return {
            schemeCode: item.schemeCode,
            shortName: fund.shortName,
            share: Number(shares[item.schemeCode]),
            annualReturn: metrics.cagr,
            risk: metrics.risk,
            worstFall: metrics.maxDrawdown,
            series: fundWindows[i]
        };
    });

    return {
        plan: { style: plan.style, amount, from: plan.from, to: plan.to },
        invested,
        mix,
        benchmark,
        funds
    };
}

// The balance series as { date, value } rows, the shape the return helpers read
function toValues(series) {
    return series.map(row => ({ date: row.date, value: row.total }));
}

// The numbers measured the same way for the mix and the benchmark.
// series: [{ date, total }]; deposits: [{ date, amount }] on the same days.
function measure(series, deposits) {
    // Yearly return (XIRR): every deposit is money going out of your pocket (negative), and
    // the final balance is money you could take back (positive) on the last day. With one
    // deposit (a lump sum) this is the same number as CAGR, so one method serves both.
    const cashflows = deposits
        .filter(day => day.amount > 0)
        .map(day => ({ date: day.date, amount: -day.amount }));
    cashflows.push({ date: series.at(-1).date, amount: series.at(-1).total });

    // Bumpiness and worst fall are read from the pretend price, so deposits don't count as gains
    const metrics = computeFundMetrics(computePretendPrice(toValues(series), deposits));

    return {
        annualReturn: computeXIRR(cashflows),
        risk: metrics.risk,
        worstFall: metrics.maxDrawdown,
        worstFallDate: metrics.troughDate
    };
}