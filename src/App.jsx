// useState gives a component a memory, and useEffect lets it run code at
// certain moments (here: once, when the page first appears)
import { useState, useEffect } from "react";
import Header from "./components/Header";
import BuildYourMix from "./components/BuildYourMix";
import HowYoudInvest from "./components/HowYoudInvest";
import MixVsBenchmark from "./components/MixVsBenchmark";
import EachFundOnItsOwn from "./components/EachFundOnItsOwn";
import HowItWorks from "./components/HowItWorks";
import Glossary from "./components/Glossary";
import Footer from "./components/Footer";
import AuthDialog from "./components/AuthDialog";
import { FUNDS } from "./lib/funds";
import { fetchAllFundsData } from "./lib/fetchAllFunds";
import { computeDateRange } from "./lib/computeDateRange";
import { validateInputs } from "./lib/validateInputs";
import { getMe } from "./lib/authApi";
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

// The name of the page in the browser's notebook (localStorage) where the wristband
// (the log-in token) is kept. Written once here so every read, save and remove uses
// exactly the same name.
const TOKEN_KEY = "corpus.token";

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

  const [loadAttempt, setLoadAttempt] = useState(0);

  function handleRetry() {
    setStatus("loading");
    setLoadAttempt(n => n + 1);
  }

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

  // Who is logged in: null for nobody, or { id, email }
  const [user, setUser] = useState(null);

  // True while the page is still asking the server "is the saved wristband still good?".
  // It starts true so the header shows nothing in the account spot until we know,
  // instead of flashing "Log in" for a moment at someone who is logged in.
  const [checkingSession, setCheckingSession] = useState(true);

  // Runs once, when the page first appears (the empty [] means nothing to watch).
  // localStorage is a small notebook the browser keeps for this site: it survives a
  // refresh and closing the tab. If a wristband is saved there, ask the server (/me)
  // whether it still works. Yes: remember who it is. No (expired, junk, or the server
  // couldn't be reached): throw the wristband away, so the person simply logs in again.
  // In development React runs this twice on purpose (StrictMode) to catch bugs, so /me
  // is asked twice; the ignore flag makes the first, cancelled run's answer harmless.
  useEffect(() => {
    let ignore = false;

    async function checkSession() {
      const token = localStorage.getItem(TOKEN_KEY);
      // getItem gives null when nothing is saved under that name: nothing to check
      if (token === null) {
        setCheckingSession(false);
        return;
      }

      try {
        const me = await getMe(token);
        if (ignore) return;
        setUser(me);
      } catch {
        if (ignore) return;
        localStorage.removeItem(TOKEN_KEY);
      }
      // Either way, the check is over
      setCheckingSession(false);
    }
    checkSession();

    return () => {
      ignore = true;
    };
  }, []);

  // The log-in pop-up (next step) calls this when the server says yes. It gets the
  // server's answer, { token, user }: save the wristband in the notebook, then remember
  // who it is. `session` is that whole answer (a different name from the `user` state).
  function handleSignedIn(session) {
    localStorage.setItem(TOKEN_KEY, session.token);
    setUser(session.user);
  }

  // The header's "Log out" button: throw the wristband away and forget who it was.
  // The server keeps no list of who's logged in, so there's nothing to tell it.
  function handleLogOut() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  // Whether the log-in pop-up should be open
  const [authOpen, setAuthOpen] = useState(false);

  // The header's "Log in" button opens the pop-up
  function handleLogInClick() {
    setAuthOpen(true);
  }

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
  }, [loadAttempt]);

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
      {/* The header shows the account spot: nothing while checking, the email and
          "Log out" when logged in, "Log in" when not */}
      <Header user={user} checkingSession={checkingSession} onLogInClick={handleLogInClick} onLogOut={handleLogOut} />
      <main>
        {/* Left column: the form cards. onSubmit is what catches the button click */}
        <form className="col" onSubmit={handleSubmit} noValidate>
          {/* Pass the shares down, plus the function a row calls to change one */}
          <BuildYourMix shares={shares} onShareChange={handleShareChange} errors={visibleErrors} />
          {/* Give the "How you'd invest" card the current plan so its boxes can show it, plus the function they call to change it */}
          <HowYoudInvest plan={plan} onPlanChange={handlePlanChange} range={range} status={status} errors={visibleErrors} onRetry={handleRetry} />
        </form>

        {/* Right column: the result cards */}
        <div className="col">
          <MixVsBenchmark results={results} />
          <EachFundOnItsOwn results={results} />
        </div>
      </main>
      {/* Two reading cards under the tool: the bookmarks the header links jump to.
          Side by side on a wide screen, one under the other on a narrow one (App.css). */}
      <div className="info">
        <HowItWorks />
        <Glossary />
      </div>
      <Footer />
      {/* The log-in pop-up. It sits on top of everything when open (the browser draws an
          open dialog above the page), so where it's written here doesn't matter.
          onClose runs however it closes (Esc, Close, or after logging in), so App always
          knows it's shut and "Log in" can open it again. */}
      <AuthDialog isOpen={authOpen} onClose={() => setAuthOpen(false)} onSignedIn={handleSignedIn} />
    </>
  );
}

export default App;