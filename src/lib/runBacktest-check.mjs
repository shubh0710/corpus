// Checks runBacktest.js on made-up price lists where the right answers are known by hand.
// Run it from the project root:   node src/lib/runBacktest-check.mjs
import { runBacktest } from "./runBacktest.js";
import { FUNDS, BENCHMARK } from "./funds.js";
import { computeFundMetrics } from "./fundMetrics.js";

let failures = 0;

function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

function reportClose(label, actual, expected, tolerance = 1e-6) {
    const passed = Math.abs(actual - expected) < tolerance;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// ---- helpers that make fake data in the same shape mfapi.in sends ----

// Every weekday from start to end, as ISO dates
function weekdays(start, end) {
    const dates = [];
    for (let day = new Date(`${start}T00:00:00Z`); day <= new Date(`${end}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + 1)) {
        const weekday = day.getUTCDay();
        if (weekday !== 0 && weekday !== 6) dates.push(day.toISOString().slice(0, 10));
    }
    return dates;
}

// mfapi.in's shape: newest first, dates as "dd-mm-yyyy", prices as text.
// priceOf(date, i) decides each day's price.
function raw(dates, priceOf) {
    const data = dates.map((date, i) => {
        const [year, month, day] = date.split("-");
        return { date: `${day}-${month}-${year}`, nav: String(priceOf(date, i)) };
    });
    return { data: data.reverse() };
}

// The six funds and the benchmark, each with its own price rule (by default, all the same)
function makeData(dates, priceFor = () => (date, i) => 10 + i * 0.01) {
    return {
        fundsData: FUNDS.map(fund => ({ name: fund.name, schemeCode: fund.schemeCode, data: raw(dates, priceFor(fund.schemeCode)) })),
        benchmarkData: { name: BENCHMARK.name, schemeCode: BENCHMARK.schemeCode, data: raw(dates, priceFor(BENCHMARK.schemeCode)) }
    };
}

const evenShares = { 118778: 25, 118989: 15, 118632: 25, 119028: 10, 119099: 15, 140088: 10 };
const allInFirst = { 118778: 100, 118989: 0, 118632: 0, 119028: 0, 119099: 0, 140088: "" };

function plan(changes) {
    return { style: "sip", sipAmount: 5000, lumpsumAmount: 100000, rebalancing: "let_it_drift", ...changes };
}

// ---- 1. yearly rebalancing isn't built yet ----
let message = "no error";
try {
    runBacktest({ ...makeData(weekdays("2021-01-04", "2022-01-04")), shares: evenShares, plan: plan({ rebalancing: "rebalance_yearly", from: "2021-01-04", to: "2022-01-04" }) });
} catch (error) {
    message = error.message;
}
report("yearly rebalancing throws a clear error", message, "Yearly rebalancing isn't built yet.");

// ---- 2. the result has exactly the shape Cards 3 and 4 read ----
const year = weekdays("2021-01-04", "2022-01-04");
const sip = runBacktest({ ...makeData(year), shares: evenShares, plan: plan({ from: "2021-01-04", to: "2022-01-04" }) });
report("top-level keys", Object.keys(sip).join(","), "plan,invested,mix,benchmark,funds");
report("plan keys", Object.keys(sip.plan).join(","), "style,amount,from,to");
report("mix keys", Object.keys(sip.mix).sort().join(","), "annualReturn,beta,finalValue,risk,series,worstFall");
report("benchmark keys", Object.keys(sip.benchmark).sort().join(","), "annualReturn,finalValue,risk,series,worstFall,worstFallDate");
report("six funds, in FUNDS order", sip.funds.map(f => f.schemeCode).join(","), FUNDS.map(f => f.schemeCode).join(","));
report("fund keys", Object.keys(sip.funds[0]).sort().join(","), "annualReturn,risk,schemeCode,series,share,shortName,worstFall");
report("mix series rows are { date, total }", Object.keys(sip.mix.series[0]).join(","), "date,total");
report("benchmark series rows are { date, total }", Object.keys(sip.benchmark.series[0]).join(","), "date,total");
report("fund series rows are { date, price }", Object.keys(sip.funds[0].series[0]).join(","), "date,price");

// ---- 3. lump sum, all in one fund that doubles in exactly a year ----
// 4 Jan 2021 to 4 Jan 2022 is 365 days; the first fund goes from 10 to 20 in a straight line
const doubling = makeData(year, code => code === 118778
    ? (date, i) => 10 + 10 * i / (year.length - 1)
    : () => 10);
const lump = runBacktest({ ...doubling, shares: allInFirst, plan: plan({ style: "lumpsum", from: "2021-01-04", to: "2022-01-04" }) });
report("lump sum: the plan uses the lump sum amount", lump.plan.amount, 100000);
report("lump sum: invested once", lump.invested, 100000);
reportClose("lump sum: 100000 doubles to 200000", lump.mix.finalValue, 200000);
reportClose("lump sum: doubling in a year is a 100% yearly return", lump.mix.annualReturn, 1);
reportClose("lump sum: a flat benchmark returns 0", lump.benchmark.annualReturn, 0);
reportClose("lump sum: the fund's own return is 100% too", lump.funds[0].annualReturn, 1);

// ---- 4. when every fund and the benchmark have the same prices, the mix IS the benchmark ----
const wavy = makeData(year, () => (date, i) => 10 + Math.sin(i / 9) + i * 0.02);
const same = runBacktest({ ...wavy, shares: evenShares, plan: plan({ from: "2021-01-04", to: "2022-01-04" }) });
reportClose("same prices: same final value", same.mix.finalValue, same.benchmark.finalValue);
reportClose("same prices: same yearly return", same.mix.annualReturn, same.benchmark.annualReturn);
reportClose("same prices: same bumpiness", same.mix.risk, same.benchmark.risk);
reportClose("same prices: same worst fall", same.mix.worstFall, same.benchmark.worstFall);
reportClose("same prices: beta is 1", same.mix.beta, 1);
report("mix and benchmark on the same days", same.mix.series.map(r => r.date).join() === same.benchmark.series.map(r => r.date).join(), true);
report("worst-fall date is one of the chart's days", same.benchmark.series.some(r => r.date === same.benchmark.worstFallDate), true);

// ---- 5. SIP: one instalment a month, holidays paid on the next trading day ----
// From 28 Jan 2021 to 30 Apr 2021: 28 Jan, 1 Mar (Feb's), 29 Mar, 28 Apr = 4 instalments
const spring = weekdays("2021-01-01", "2021-05-31");
const fourMonths = runBacktest({ ...makeData(spring), shares: evenShares, plan: plan({ from: "2021-01-28", to: "2021-04-30" }) });
report("SIP: invested = 4 instalments x 5000", fourMonths.invested, 20000);
report("SIP: the headline's month count comes out whole", fourMonths.invested / fourMonths.plan.amount, 4);

// From on the 31st (a Sunday): the SIP day is capped at 28, so every month's instalment
// lands in its own month: 1 Feb (From's), 1 Mar (Feb's), 29 Mar, 28 Apr = 4 by 30 April.
// Without the cap, April's would be "due on 31 April" and slip into May.
const fromThe31st = runBacktest({ ...makeData(spring), shares: evenShares, plan: plan({ from: "2021-01-31", to: "2021-04-30" }) });
report("SIP from the 31st: one instalment a month (4)", fromThe31st.invested, 20000);

// A flat price: whatever goes in is what's there, a 0% return
const flatSip = runBacktest({ ...makeData(spring, () => () => 10), shares: evenShares, plan: plan({ from: "2021-01-28", to: "2021-04-30" }) });
reportClose("flat prices: SIP return is 0", flatSip.mix.annualReturn, 0);
reportClose("flat prices: final value = invested", flatSip.mix.finalValue, 20000);
// The balance jumps every month, but only because money goes in: none of that is a gain,
// so a flat price must show no bumpiness and no worst fall
reportClose("flat prices: deposits aren't bumpiness", flatSip.mix.risk, 0);
reportClose("flat prices: deposits aren't a fall", flatSip.benchmark.worstFall, 0);

// ---- 6. Gold BeES's 100-for-1 split is undone ----
// Gold's real value rises smoothly, but before 23 Dec 2019 its price is quoted 100x higher
const winter = weekdays("2019-12-02", "2020-03-31");
const smooth = (date, i) => 30 + i * 0.05;
const withSplit = makeData(winter, code => code === 140088
    ? (date, i) => (date < "2019-12-23" ? smooth(date, i) * 100 : smooth(date, i))
    : () => 10);
const gold = runBacktest({ ...withSplit, shares: { ...allInFirst, 118778: 0, 140088: 100 }, plan: plan({ style: "lumpsum", from: "2019-12-02", to: "2020-03-31" }) });
const goldFund = gold.funds.find(f => f.schemeCode === 140088);
report("split: Gold's worst fall isn't the fake 99% drop", goldFund.worstFall, 0);
reportClose("split: Gold's first price is in today's units", goldFund.series[0].price, 30);
report("split: the mix doesn't 'crash' either", gold.mix.worstFall, 0);

// ---- 7. one fund missing a day ----
// The second fund skips 15 Mar 2021. The mix and benchmark drop that day; the first
// fund's own numbers stay exactly as they were.
const gappy = makeData(spring, () => (date, i) => 10 + Math.sin(i / 5) + i * 0.03);
const gappyNoGap = runBacktest({ ...gappy, shares: evenShares, plan: plan({ from: "2021-01-28", to: "2021-04-30" }) });
gappy.fundsData[1].data.data = gappy.fundsData[1].data.data.filter(row => row.date !== "15-03-2021");
const gappyRun = runBacktest({ ...gappy, shares: evenShares, plan: plan({ from: "2021-01-28", to: "2021-04-30" }) });
report("missing day: dropped from the mix", gappyRun.mix.series.some(r => r.date === "2021-03-15"), false);
report("missing day: dropped from the benchmark", gappyRun.benchmark.series.some(r => r.date === "2021-03-15"), false);
reportClose("missing day: another fund's own numbers unchanged", gappyRun.funds[0].risk, gappyNoGap.funds[0].risk);

// ---- 8. each fund's numbers are its own window's numbers ----
const firstOwn = computeFundMetrics(same.funds[0].series);
reportClose("fund numbers = computeFundMetrics on its window", same.funds[0].worstFall, firstOwn.maxDrawdown);
report("an empty share box counts as 0", lump.funds[5].share, 0);

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);