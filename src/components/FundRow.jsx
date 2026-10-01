import "./FundRow.css";

// One row in the "Build your mix" card: colour dot, fund name with its
// category underneath, and a box to type this fund's share of the mix.
// The row keeps no data of its own. App sends down the current share and
// a function to call when the box changes.
export default function FundRow({ fund, share, onShareChange, errorId }) {
    return (
        <div className="wrow">
            {/* The coloured dot */}
            <span className={`swatch ${fund.swatchClass}`}></span>

            <label htmlFor={`fund-${fund.schemeCode}`}>
                {fund.shortName}
                <small>{fund.category}</small>
            </label>

            {/* Controlled input: it always shows the share App sends down, and
                reports every keystroke back through onShareChange. */}
            <input
                className="num"
                type="number"
                id={`fund-${fund.schemeCode}`}
                name={`fund-${fund.schemeCode}`}
                min="0"
                max="100"
                step="1"
                value={share}
                aria-invalid={Boolean(errorId)}
                aria-describedby={errorId}
                onChange={event => onShareChange(fund.schemeCode, event.target.value)}
            />
        </div>
    );
}