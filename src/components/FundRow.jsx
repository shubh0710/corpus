import './FundRow.css';

// A single row displaying one fund's basic info. Receives the fund's data
// via props, destructured straight to `fund`
export default function FundRow({ fund }) {
    return (
        <div className="fund-row">
            {/* The coloured dot */}
            <span className={`swatch ${fund.swatchClass}`}></span>

            {/* Fund name, pulled from the fund object */}
            <span>{fund.name}</span>

            {/* Category text, like "Small cap equity" */}
            <small>{fund.category}</small>
        </div>
    );
}