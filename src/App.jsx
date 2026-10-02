// useState gives a component a memory, and useEffect lets it run code at
// certain moments (here: once, when the page first appears)
import { useState, useEffect } from "react";
import Header from "./components/Header";
import BuildYourMix from "./components/BuildYourMix";
import HowYoudInvest from "./components/HowYoudInvest";
import MixVsBenchmark from "./components/MixVsBenchmark";
import EachFundOnItsOwn from "./components/EachFundOnItsOwn";
import Footer from "./components/Footer";
import { FUNDS } from "./lib/funds";
import { fetchAllFundsData } from "./lib/fetchAllFunds";
import { computeDateRange } from "./lib/computeDateRange";
import { validateInputs } from "./lib/validateInputs";
import { sampleResults } from "../fixtures/sample-results";
import "./App.css";

// App is the top of the page. Every card is its own component in
// /components, and App's job is to put them together and to hold the
// data that more than one card needs (the shares, the plan and the results).

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
// `from` and `to` start empty because we don't know the dates yet. They
// get filled in once the fund data has loaded (see the useEffect below).
const initialPlan = {
  style: "sip",
  sipAmount: 5000,
  lumpsumAmount: 100000,
  rebalancing: "let_it_drift",
  from: "",
  to: ""
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

  const [status, setStatus] = useState("loading");

  // The first and last dates that all the funds share, like
  // { start: "2019-09-11", end: "2026-08-19" }. It's null (nothing yet)
  // until the data arrives, and the cards use it to limit the date boxes.
  const [range, setRange] = useState(null);

  // Whether the error messages are allowed to show yet. It starts false so a
  // fresh page isn't covered in red, and becomes true the first time someone
  // clicks "Run the numbers". It stays true after that.
  const [showErrors, setShowErrors] = useState(false);

  // What's wrong with the current choices, worked out again on every render
  // from `shares` and `plan`. It's not stored in state, because it can always be
  // worked out from what we already have. validateInputs needs `range`, which
  // is null until the data has loaded, so before that we don't call it.
  const errors = status === "ready" ? validateInputs({ shares, plan, range }) : {};

  // The messages the cards actually get to show: none ({}) until the first submit.
  // handleSubmit below still uses the full `errors`, so it can always tell whether
  // something is wrong, even on that very first click.
  const visibleErrors = showErrors ? errors : {};

  // The numbers the two result cards will show. It starts as null (nothing yet),
  // so the cards stay empty until someone runs the numbers successfully.
  const [results, setResults] = useState(null);

  // Runs after the page first appears on screen. The empty [] at the very end
  // means "do this once, and not again on later re-draws". That's what we want
  // for downloading the fund data, because it only needs to happen once.
  useEffect(() => {
    let ignore = false;

    async function loadFunds() {
      try {
        const result = await fetchAllFundsData();
        if (ignore) return;

        const dateRange = computeDateRange(result.fundsData, result.benchmarkData);

        setRange(dateRange);
        setPlan(current => ({ ...current, from: dateRange.start, to: dateRange.end }));
        setStatus("ready");
      } catch (error) {
        if (ignore) return;
        console.error("Could not load fund data:", error);
        setStatus("error");
      }
    }
    loadFunds();

    return () => {
      ignore = true;
    };
  }, []);

  // Runs when the form is submitted, which happens when someone clicks
  // "Run the numbers" or presses Enter inside a box.
  function handleSubmit(event) {
    // Left alone, the browser would send the form off and reload the page,
    // and everything typed so far would disappear. This stops that.
    event.preventDefault();
    // From now on the messages are allowed to show
    setShowErrors(true);
    // If anything is wrong, stop here. The messages are already on screen.
    // Object.keys(errors) lists the broken fields, and an empty list means all is fine.
    if (Object.keys(errors).length > 0) return;
    // Everything is fine, so save the made-up results. React sees the change
    // and re-draws the page, handing the new results to the cards.
    setResults(sampleResults);
  }

  return (
    <>
      <Header />
      <main>
        {/* Left column: the form cards. onSubmit is what catches the button click */}
        <form className="col" onSubmit={handleSubmit} noValidate>
          {/* Pass the shares down, plus the function a row calls to change one */}
          <BuildYourMix shares={shares} onShareChange={handleShareChange} errors={visibleErrors} />
          {/* Give the "How you'd invest" card the current plan so its boxes can show it, plus the function they call to change it */}
          <HowYoudInvest plan={plan} onPlanChange={handlePlanChange} range={range} status={status} errors={visibleErrors} />
        </form>

        {/* Right column: the result cards */}
        <div className="col">
          <MixVsBenchmark results={results} />
          <EachFundOnItsOwn results={results} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export default App;