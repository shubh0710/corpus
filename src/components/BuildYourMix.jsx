import FundRow from "./FundRow";
import { FUNDS } from "../lib/funds";
import "./BuildYourMix.css";

// Card 1: "Build your mix". It gets two things from App:
//   shares        - the current share of every fund, e.g. { 118778: 25, ... }
//   onShareChange - the function a row calls when its box changes
// Everything shown here (ribbon, legend, total) is worked out from `shares`
// each time the card draws, so it can never disagree with the boxes.
export default function BuildYourMix({ shares, onShareChange, errors }) {
    // The id of the message under the Total line, or undefined when there is no message.
    // Each share box gets it so a screen reader can read the message when the box is focused.
    const sharesErrorId = errors.shares ? "shares-error" : undefined;

    // Running totals: one bucket per asset class (for the legend),
    // plus one grand total for the "Total allocated" line
    const byClass = { equity: 0, debt: 0, gold: 0 };
    let total = 0;

    for (const fund of FUNDS) {
        // A cleared box holds "" and Number("") is 0, so it counts as zero
        const share = Number(shares[fund.schemeCode]);

        // Brackets pick the bucket by name: "equity", "debt" or "gold"
        byClass[fund.assetClass] += share;
        total += share;
    }

    // The total line has three cases. Order matters: JavaScript stops at
    // the first true condition, so the exact case goes first.
    const isReady = total === 100;
    let totalText;
    if (isReady) {
        totalText = "100% — ready";
    } else if (total < 100) {
        totalText = `${total}% — ${100 - total} to go`;
    } else {
        totalText = `${total}% — ${total - 100} over`;
    }

    return (
        <section className="panel">
            <fieldset>
                <legend className="panel-title">Build your mix</legend>
                <p className="panel-subtitle">Assign a share to each fund. They have to add up to 100%.</p>

                <div
                    className="ribbon"
                    role="img"
                    aria-label={`Allocation: ${byClass.equity}% equity, ${byClass.debt}% debt, ${byClass.gold}% gold, split across six funds.`}
                >
                    {FUNDS.map(fund => (
                        // key lets React tell the segments apart when they change.
                        // The class gives the colour, the width is that fund's share.
                        <span
                            key={fund.schemeCode}
                            className={fund.swatchClass}
                            style={{ width: `${Number(shares[fund.schemeCode])}%` }}
                        ></span>
                    ))}
                </div>

                <p className="ribbon-legend">
                    <span>Equity <strong>{byClass.equity}%</strong></span>
                    <span>Debt <strong>{byClass.debt}%</strong></span>
                    <span>Gold <strong>{byClass.gold}%</strong></span>
                </p>

                {FUNDS.map(fund => (
                    <FundRow
                        key={fund.schemeCode}
                        fund={fund}
                        share={shares[fund.schemeCode]}
                        onShareChange={onShareChange}
                        errorId={sharesErrorId}
                    />
                ))}

                <p className="total">
                    <span>Total allocated</span>
                    <b className={`total-value ${isReady ? "" : "is-off"}`}>{totalText}</b>
                </p>
                {/* One message for the whole group, shown only when there is one */}
                {errors.shares && <p className="field-error" id={sharesErrorId}>{errors.shares}</p>}
            </fieldset>
        </section>
    );
}