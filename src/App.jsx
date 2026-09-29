import { useState } from "react";
import Header from "./components/Header";
import BuildYourMix from "./components/BuildYourMix";
import HowYoudInvest from "./components/HowYoudInvest";
import MixVsBenchmark from "./components/MixVsBenchmark";
import EachFundOnItsOwn from "./components/EachFundOnItsOwn";
import Footer from "./components/Footer";
import { FUNDS } from "./lib/funds";
import "./App.css";

// The starting shares, built once as one object keyed by scheme code:
// { 118778: 25, 118989: 15, ... }
// It sits outside App() so it's built once, not on every re-render.
const initialShares = {};
for (const fund of FUNDS) {
  initialShares[fund.schemeCode] = fund.defaultShare;
}

function App() {
  // The one place that remembers every fund's share. It lives here in App
  // because several cards will need it, and App is their closest common parent.
  // `shares` is the current value, `setShares` is how we change it.
  const [shares, setShares] = useState(initialShares);

  // A row calls this whenever its box changes.
  function handleShareChange(schemeCode, newValue) {
    // A box's text always arrives as a string. If it's empty (the user
    // cleared it), keep it empty so the box can stay blank while typing.
    // Otherwise turn it into a real number so the maths works later.
    const value = newValue === "" ? "" : Number(newValue);

    // Make a copy of the old shares, then overwrite just this one fund.
    // React only re-draws when it gets a NEW object, so we never edit
    // the old one directly.
    setShares({ ...shares, [schemeCode]: value });
  }

  return (
    <>
      <Header />
      <main>
        {/* Left column: the form cards */}
        <form className="col">
          {/* Pass the shares down, plus the function a row calls to change one */}
          <BuildYourMix shares={shares} onShareChange={handleShareChange} />
          <HowYoudInvest />
        </form>

        {/* Right column: the result cards */}
        <div className="col">
          <MixVsBenchmark />
          <EachFundOnItsOwn />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App