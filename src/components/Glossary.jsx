import "./Glossary.css";

// Every word the page uses that might need explaining, with its meaning.
// Written once as a list, so the card below can stamp out one entry for each.
const TERMS = [
    { term: "NAV (Net Asset Value)", meaning: "The price of one unit of a fund on a given day." },
    { term: "SIP (Systematic Investment Plan)", meaning: "Investing a fixed amount on the same date every month." },
    { term: "Lump sum", meaning: "Investing the whole amount once, at the start." },
    { term: "Benchmark", meaning: "What your mix is compared against. Here, the Motilal Oswal Nifty 500 Index Fund, which follows 500 of India's largest listed companies." },
    { term: "XIRR", meaning: "The yearly return when money goes in on different dates, as in a SIP. It allows for each instalment being invested for a different length of time." },
    { term: "CAGR", meaning: "The steady yearly growth rate that turns a starting amount into a final amount. Used for lump sums." },
    { term: "Bumpiness (volatility)", meaning: "How much the value swings up and down, measured per year. New SIP money isn't counted as a gain, so only market moves count." },
    { term: "Worst fall (maximum drawdown)", meaning: "The biggest drop from a high point to a later low. It's the largest fall you'd have seen on paper." },
    { term: "Sensitivity (beta)", meaning: "How much your mix tends to move when the market moves. 1.0 moves with it; 0.8 moves about 80% as much." },
    { term: "Rebalancing", meaning: "Resetting your mix back to its original shares. \"Let it drift\" never resets; \"Rebalance yearly\" resets once a year." },
    { term: "Direct plan, Growth option", meaning: "The version of a fund with no distributor commission (so lower costs), where gains are reinvested instead of paid out. Corpus uses this version for every fund." }
];

// The "Glossary" card. id="glossary" is the bookmark the header's "Glossary"
// link (href="#glossary") jumps to. All static, so no props.
export default function Glossary() {
    return (
        <section className="panel" id="glossary">
            <h2 className="panel-title">Glossary</h2>

            {/* <dl> is a description list, HTML's own dictionary: <dt> is the term,
                <dd> is what it means. HTML allows each pair to sit in a <div>, which
                gives .map one thing to hand back per term (and one place for the key). */}
            <dl className="glossary">
                {TERMS.map(item => (
                    <div key={item.term}>
                        <dt>{item.term}</dt>
                        <dd>{item.meaning}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}