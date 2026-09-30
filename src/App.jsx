import { useState } from "react";
import Header from "./components/Header";
import BuildYourMix from "./components/BuildYourMix";
import HowYoudInvest from "./components/HowYoudInvest";
import MixVsBenchmark from "./components/MixVsBenchmark";
import EachFundOnItsOwn from "./components/EachFundOnItsOwn";
import Footer from "./components/Footer";
import { FUNDS } from "./lib/funds";
import "./App.css";

// App is the top of the page. Every card is its own component in
// /components, and App's job is to put them together and to hold the
// data that more than one card needs (the shares and the plan).

// The starting shares, built once as one object keyed by scheme code:
// { 118778: 25, 118989: 15, ... }
// It sits outside App() so it's built once, not on every re-render.
const initialShares = {};
for (const fund of FUNDS) {
  initialShares[fund.schemeCode] = fund.defaultShare;
}

// The starting choices for the "How you'd invest" card.
// SIP and lump sum each get their own amount, so flipping between the
// two modes doesn't throw away what the person typed in the other one.
const initialPlan = {
  style: "sip",
  sipAmount: 5000,
  lumpsumAmount: 100000,
  rebalancing: "let_it_drift",
  from: "2019-09-11",
  to: "2026-08-19"
};

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

  // Same idea as `shares`, but for the "How you'd invest" card.
  // `plan` is what's chosen right now, `setPlan` is how we change it.
  const [plan, setPlan] = useState(initialPlan);

  // Any box in that card calls this. `field` says which one changed
  // ("style", "sipAmount", "from"...) and `value` is what it changed to.
  function handlePlanChange(field, value) {
    setPlan({ ...plan, [field]: value });
  }

  // Runs when the form is submitted, which happens when someone clicks
  // "Run the numbers" or presses Enter inside a box.
  function handleSubmit(event) {
    // Left alone, the browser would send the form off and reload the page,
    // and everything typed so far would disappear. This stops that.
    event.preventDefault();
    console.log("shares:", shares);
    console.log("plan:", plan);
  }

  return (
    <>
      <Header />
      <main>
        {/* Left column: the form cards. onSubmit is what catches the button click */}
        <form className="col" onSubmit={handleSubmit}>
          {/* Pass the shares down, plus the function a row calls to change one */}
          <BuildYourMix shares={shares} onShareChange={handleShareChange} />
          {/* Give the "How you'd invest" card the current plan so its boxes can show it, plus the function they call to change it */}
          <HowYoudInvest plan={plan} onPlanChange={handlePlanChange} />
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