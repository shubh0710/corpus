import FundRow from "./components/FundRow";
import { FUNDS } from "./lib/funds";

function App() {
  return (
    // Fragment (<>...</>) — an invisible wrapper. A component can only
    // return ONE root element, but .map() below produces 6 separate
    // FundRow elements as siblings — this satisfies that rule without
    // adding an extra, unwanted <div> to the actual page markup.
    <>
      {FUNDS.map(fund => (
        // schemeCode is a good key because it's unique per fund and never changes.
        <FundRow key={fund.schemeCode} fund={fund} />
      ))}
    </>
  )
}

export default App