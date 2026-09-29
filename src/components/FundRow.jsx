import './FundRow.css';

// One row in the "Build your mix" card: colour dot, fund name with its
// category underneath, and a box to type this fund's share of the mix.
export default function FundRow({ fund }) {
    return (
        <div className="wrow">
            {/* The coloured dot */}
            <span className={`swatch ${fund.swatchClass}`}></span>

            <label htmlFor={`fund-${fund.schemeCode}`}>
                {fund.shortName}
                <small>{fund.category}</small>
            </label>

            {/* the share input. defaultValue sets the starting number,
                and the user can still type over it. */}
            <input
                className="num"
                type="number"
                id={`fund-${fund.schemeCode}`}
                name={`fund-${fund.schemeCode}`}
                min="0"
                max="100"
                step="1"
                defaultValue={fund.defaultShare}
            />
        </div>
    );
}