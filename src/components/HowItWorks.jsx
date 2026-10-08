import "./HowItWorks.css";

// The four steps, written once as a list, so the card below can stamp out
// one step for each with .map. Each has a short title and a sentence or two.
const STEPS = [
    {
        title: "Build your mix",
        text: "Give each of the six funds a share. The shares must add up to 100%."
    },
    {
        title: "Choose how you'd invest",
        text: "A fixed amount every month (SIP) or one amount up front (lump sum), plus the dates to test."
    },
    {
        title: "Corpus replays history",
        text: "Using each fund's real daily price, it buys units on the days you would have, and tracks what they were worth every day after. The same money goes into the Nifty 500 index fund, so the comparison is fair."
    },
    {
        title: "Read the results",
        text: "Your yearly return, how bumpy the ride was, the worst fall, and how closely your mix moved with the market. Then each fund on its own."
    }
];

// The "How it works" card. id="how-it-works" is the bookmark the header's
// "How it works" link (href="#how-it-works") jumps to. All static, so no props.
export default function HowItWorks() {
    return (
        <section className="panel" id="how-it-works">
            <h2 className="panel-title">How it works</h2>

            {/* <ol> is an ordered list: the browser writes the numbers 1, 2, 3, 4 itself,
                and a screen reader says "step 1 of 4". The key is the title, because
                each step's title is different and never changes. */}
            <ol className="steps">
                {STEPS.map(step => (
                    <li key={step.title}>
                        <strong className="step-title">{step.title}</strong>
                        {step.text}
                    </li>
                ))}
            </ol>
        </section>
    );
}