import FundRow from "./FundRow";
import { FUNDS } from "../lib/funds";

export default function BuildYourMix() {
    return (
        <section className="panel">
            <fieldset>
                <legend className="panel-title">Build your mix</legend>

                {FUNDS.map(fund => (
                    <FundRow key={fund.schemeCode} fund={fund} />
                ))}
            </fieldset>
        </section>
    );
}