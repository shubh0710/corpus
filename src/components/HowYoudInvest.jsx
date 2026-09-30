import "./HowYoudInvest.css";

// The two investment styles, kept as data so the radio buttons can be
// built with .map() instead of writing each one out by hand.
// `value` is what gets saved in the plan, `label` is the text people see.
const STYLE_OPTIONS = [
    { value: "sip", label: "Monthly SIP" },
    { value: "lumpsum", label: "Lump sum" }
];

// The dropdown's choices, kept as data the same way: `value` is what gets
// saved in the plan, `label` is the text in the list. A third choice later
// would just be one more line here.
const REBALANCING_OPTIONS = [
    { value: "let_it_drift", label: "Let it drift" },
    { value: "rebalance_yearly", label: "Rebalance yearly" }
];

// This card doesn't remember anything itself. `plan` (what's chosen right
// now) comes down from App, and `onPlanChange` is the function we call
// to tell App that something changed.
export default function HowYoudInvest({ plan, onPlanChange }) {
    // SIP and lump sum each keep their own amount inside the plan. The amount
    // box shows and edits whichever one matches the mode that's picked.
    const amountKey = plan.style === "sip" ? "sipAmount" : "lumpsumAmount";

    // The label above the amount box changes with the mode too.
    const amountLabel = plan.style === "sip" ? "Amount each month" : "Amount to invest";

    return (
        <section className="panel">
            {/* fieldset + legend groups the related boxes and gives screen readers a title for the group */}
            <fieldset>
                <legend className="panel-title">How you'd invest</legend>
                <p className="panel-subtitle">Choose the pattern to replay through history.</p>

                <fieldset className="style-field">
                    <legend className="field-label">Investment style</legend>
                    <div className="seg">
                        {/* One radio per style, made from STYLE_OPTIONS. `key` lets React tell
                            the rows apart. Both radios share the same name, so the browser treats
                            them as one group: only one can be picked, and the arrow keys move
                            between them. `checked` is true only for the style that matches the
                            plan, so the screen always follows the plan. Clicking one tells App
                            the new style. */}
                        {STYLE_OPTIONS.map(option => (
                            <span className="radio-wrap" key={option.value}>
                                <input type="radio" id={`style-${option.value}`} name="investment_style"
                                    value={option.value} checked={plan.style === option.value}
                                    onChange={event => onPlanChange("style", event.target.value)} />
                                <label htmlFor={`style-${option.value}`}>{option.label}</label>
                            </span>
                        ))}
                    </div>
                </fieldset>

                <div className="field-row">
                    <div className="field">
                        <label className="field-label" htmlFor="amount">{amountLabel}</label>
                        {/* Typed text always arrives as a string, so we turn it into a number.
                            An empty box stays empty, otherwise clearing it would leave a stray 0. */}
                        <input className="num" type="number" id="amount" name="amount"
                            value={plan[amountKey]}
                            onChange={event => onPlanChange(amountKey, event.target.value === "" ? "" : Number(event.target.value))} />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="rebalancing">Rebalancing</label>
                        {/* On a dropdown, the chosen value goes on the <select> itself,
                            not on the individual options. The options come from REBALANCING_OPTIONS. */}
                        <select id="rebalancing" name="rebalancing" value={plan.rebalancing}
                            onChange={event => onPlanChange("rebalancing", event.target.value)}>
                            {REBALANCING_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="field-row">
                    <div className="field">
                        <label className="field-label" htmlFor="from">From</label>
                        <input type="date" id="from" name="from" value={plan.from}
                            onChange={event => onPlanChange("from", event.target.value)} />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="to">To</label>
                        <input type="date" id="to" name="to" value={plan.to}
                            onChange={event => onPlanChange("to", event.target.value)} />
                    </div>
                </div>

                {/* type="submit" means clicking this (or pressing Enter in a box) submits the
                    form, and App's handleSubmit catches it */}
                <button type="submit" className="btn-primary">Run the numbers</button>
                <p className="note">History starts 11 Sep 2019 — that's as far back as the benchmark fund goes.</p>
            </fieldset>
        </section>
    );
}