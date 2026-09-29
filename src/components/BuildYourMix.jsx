import FundRow from "./FundRow";
import { FUNDS } from "../lib/funds";
import './BuildYourMix.css'

export default function BuildYourMix() {
    return (
        <section className="panel">
            <fieldset>
                <legend className="panel-title">Build your mix</legend>
                <p className="panel-subtitle">Assign a share to each fund. They have to add up to 100%.</p>

                <div
                    className="ribbon"
                    role="img"
                    aria-label="Allocation: 75% equity, 15% debt, 10% gold, split across six funds."
                >
                    {FUNDS.map(fund => (
                        <span
                            key={fund.schemeCode}
                            className={fund.swatchClass}
                            style={{ width: `${fund.defaultShare}%` }}
                        ></span>
                    ))}
                </div>

                <p className="ribbon-legend">
                    <span>Equity <strong>75%</strong></span>
                    <span>Debt <strong>15%</strong></span>
                    <span>Gold <strong>10%</strong></span>
                </p>

                {FUNDS.map(fund => (
                    <FundRow key={fund.schemeCode} fund={fund} />
                ))}

                <p className="total">
                    <span>Total allocated</span>
                    <b className="total-value">100% — ready</b>
                </p>
            </fieldset>
        </section>
    );
}