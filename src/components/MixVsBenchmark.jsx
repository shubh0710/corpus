import "./MixVsBenchmark.css";
import { formatRupees, formatPercent } from "../lib/formatNumbers";
import { formatMonthYear } from "../lib/formatDisplayDate";
import GrowthChart from "./GrowthChart";

export default function MixVsBenchmark({ results }) {

    if (results === null) {
        return (
            <section className="panel">
                <h2 className="eyebrow">Your mix vs benchmark</h2>
                <p className="note">Run the numbers to see how your mix would have done against the Nifty 500 index fund.</p>
            </section>
        );
    }

    const { plan, invested, mix, benchmark } = results;

    // The headline sentence. A ternary picks one of two sentences: "if this is true, use
    // the first one, otherwise use the second one". amountText is worked out once so both
    // sentences can use it. For a SIP, the number of months is the money that went in
    // divided by the amount put in each month: 415000 / 5000 = 83.
    const amountText = formatRupees(plan.amount);
    const headline = plan.style === "sip"
        ? `${amountText} a month, ${invested / plan.amount} months`
        : `${amountText} invested once`;

    // The dates the test ran for, like "Sep 2019 — Aug 2026". It is called windowText
    // because window is already a name the browser uses for the whole page, and we
    // don't want to hide that one.
    const windowText = `${formatMonthYear(plan.from)} — ${formatMonthYear(plan.to)}`;

    // Verdict 1, the yearly return. The gap is the mix's return minus the benchmark's, so it
    // is above 0 when the mix did better. formatPercent already puts "−" in front of a
    // negative number but nothing in front of a positive one, so we add the "+" ourselves,
    // and only when the gap is above 0. formatPercent shows one digit after the point unless
    // told otherwise, so we get "+2.2%".
    const returnGap = mix.annualReturn - benchmark.annualReturn;
    const returnText = (returnGap > 0 ? "+" : "") + formatPercent(returnGap);
    const returnLabel = returnGap > 0 ? "higher annual return" : "lower annual return";

    // Verdict 2, bumpiness (risk). mix.risk / benchmark.risk says how big the mix's swings are
    // compared with the benchmark's, so 1 minus that is how much smaller they are. Above 0
    // means less bumpy. The label already says "less" or "more", so the text shows only the
    // size: Math.abs removes a minus sign (Math.abs(-0.14) gives 0.14). Most numbers use the
    // default of one digit after the point, so only the odd ones say so out loud: this 0
    // means no digits after the point: "14%".
    const bumpinessGap = 1 - mix.risk / benchmark.risk;
    const bumpinessText = formatPercent(Math.abs(bumpinessGap), 0);
    const bumpinessLabel = bumpinessGap > 0 ? "less bumpy" : "more bumpy";

    // Verdict 3, the worst fall. The same idea again, with worstFall.
    const worstFallGap = 1 - mix.worstFall / benchmark.worstFall;
    const worstFallText = formatPercent(Math.abs(worstFallGap), 0);
    const worstFallLabel = worstFallGap > 0 ? "smaller worst fall" : "bigger worst fall";

    // The small print under "Return a year" in the table depends on how the money went in.
    const returnNote = plan.style === "sip" ? "XIRR, since you invest monthly" : "CAGR, since you invest once";

    return (
        <section className="panel">
            <div className="result-head">
                <div>
                    <p className="eyebrow">Your mix vs benchmark</p>
                    <h2 className="result-headline">{headline}</h2>
                </div>
                <p className="result-window num">{windowText}</p>
            </div>

            <div className="verdicts">
                <div className="verdict">
                    <p className="verdict-value">{returnText}</p>
                    <p className="verdict-label">{returnLabel}</p>
                </div>
                <div className="verdict">
                    <p className="verdict-value">{bumpinessText}</p>
                    <p className="verdict-label">{bumpinessLabel}</p>
                </div>
                <div className="verdict">
                    <p className="verdict-value">{worstFallText}</p>
                    <p className="verdict-label">{worstFallLabel}</p>
                </div>
            </div>

            <GrowthChart mixSeries={mix.series} benchmarkSeries={benchmark.series} worstFallDate={benchmark.worstFallDate} />

            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Measure</th>
                            <th>Your mix</th>
                            <th>Benchmark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Six rows, written one by one because each is formatted differently */}
                        <tr>
                            <td className="stacked-label">Return a year<small>{returnNote}</small></td>
                            <td className="num mix">{formatPercent(mix.annualReturn)}</td>
                            <td className="num bm">{formatPercent(benchmark.annualReturn)}</td>
                        </tr>
                        <tr>
                            <td className="stacked-label">Bumpiness<small>How much it swings, per year</small></td>
                            <td className="num mix">{formatPercent(mix.risk)}</td>
                            <td className="num bm">{formatPercent(benchmark.risk)}</td>
                        </tr>
                        <tr>
                            <td className="stacked-label">Worst fall<small>Peak to trough, at its lowest</small></td>
                            {/* The stored worst fall is a positive number (0.246), so the minus in front turns it into a fall: "−24.6%" */}
                            <td className="num mix">{formatPercent(-mix.worstFall)}</td>
                            <td className="num bm">{formatPercent(-benchmark.worstFall)}</td>
                        </tr>
                        <tr>
                            <td className="stacked-label">Sensitivity<small>Beta — 1.0 moves with the market</small></td>
                            {/* toFixed(2) always gives two digits after the point: 0.82 stays "0.82", 1.2 becomes "1.20".
                                The benchmark is measured against itself, so its beta is always 1 and we write it directly. */}
                            <td className="num mix">{mix.beta.toFixed(2)}</td>
                            <td className="num bm">1.00</td>
                        </tr>
                        <tr>
                            <td className="stacked-label">You put in</td>
                            <td className="num mix">{formatRupees(invested)}</td>
                            <td className="num bm">{formatRupees(invested)}</td>
                        </tr>
                        <tr>
                            <td className="stacked-label">You'd have</td>
                            <td className="num mix">{formatRupees(mix.finalValue)}</td>
                            <td className="num bm">{formatRupees(benchmark.finalValue)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="note">Simulated on published NAVs. Past performance doesn't predict future returns.</p>
        </section>
    );
}