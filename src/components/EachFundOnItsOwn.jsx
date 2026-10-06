import { formatPercent } from "../lib/formatNumbers";
import Sparkline from "./Sparkline";
import "./EachFundOnItsOwn.css";

export default function EachFundOnItsOwn({ results }) {

    if (results === null) {
        return (
            <section className="panel">
                <h2 className="eyebrow">Each fund on its own</h2>
                <p className="note">Run the numbers to see how each of your funds did on its own.</p>
            </section>
        );
    }

    return (
        <section className="panel">
            <h2 className="eyebrow">Each fund on its own</h2>

            <div className="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Fund</th>
                            <th>Share</th>
                            <th className="spark-cell">Shape</th>
                            <th>Return</th>
                            <th>Bumpiness</th>
                            <th>Worst fall</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* .map goes through the list of funds one by one and hands back one <tr> for each,
                            like a stamp that prints the same row again and again with different ink.
                            fund is the name for "the fund we are on right now". The key is a name tag that
                            tells React which row is which. It is the scheme code, because a fund's code never
                            changes, even if the funds are reordered later. */}
                        {results.funds.map(fund => (
                            <tr key={fund.schemeCode}>
                                <td>{fund.shortName}</td>
                                {/* share is already a whole number like 25, so we only add the % sign */}
                                <td className="num">{fund.share}%</td>
                                <td className="spark-cell"><Sparkline series={fund.series} /></td>
                                <td className="num">{formatPercent(fund.annualReturn)}</td>
                                <td className="num">{formatPercent(fund.risk)}</td>
                                {/* The stored worst fall is positive (0.342), so the minus in front turns it into a fall: "−34.2%" */}
                                <td className="num neg">{formatPercent(-fund.worstFall)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}