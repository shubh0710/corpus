// A single row displaying one fund's basic info. Receives the fund's data
// via props, destructured straight to `fund`
export default function FundRow({ fund }) {
    return (
        <div className="fund-row">
            <span>{fund.name}</span>
            <span>{fund.schemeCode}</span>
        </div>
    );
}