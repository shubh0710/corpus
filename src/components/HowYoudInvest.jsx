import "./HowYoudInvest.css";
import { formatDisplayDate } from "../lib/formatDisplayDate";

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

// This card doesn't remember anything itself. Everything it needs comes
// down from App as props:
//   plan         - what's chosen right now (style, amounts, dates...)
//   onPlanChange - the function we call to tell App that something changed
//   range        - the first and last dates the fund data covers
//                  (it's null until the data has finished loading)
//   status       - "loading", "error" or "ready", so we know what to show
export default function HowYoudInvest({ plan, onPlanChange, range, status }) {
    // SIP and lump sum each keep their own amount inside the plan. The amount
    // box shows and edits whichever one matches the mode that's picked.
    const amountKey = plan.style === "sip" ? "sipAmount" : "lumpsumAmount";

    // The label above the amount box changes with the mode too.
    const amountLabel = plan.style === "sip" ? "Amount each month" : "Amount to invest";

    // `range` is null while the data is still loading, and asking null for
    // .start would crash the page. So we check first: use range.start if range
    // exists, otherwise use undefined. A date box given undefined for min or max
    // just has no limit yet.
    const rangeStart = range ? range.start : undefined;
    const rangeEnd = range ? range.end : undefined;

    // The small text under the button. It starts as the "loading" message, and
    // gets swapped once we know whether the data arrived or failed.
    // `noteClass` is the CSS class on that text: plain grey normally, red on error.
    let noteText = "Loading fund history…";
    let noteClass = "note";
    if (range) {
        noteText = `History starts ${formatDisplayDate(range.start)} — that's as far back as the data goes.`;
    } else if (status === "error") {
        noteText = "Couldn't load the fund data. Check your connection and refresh the page.";
        noteClass = "note is-error";
    }

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

                {/* `min` and `max` are the limits of the calendar: nobody can pick a date
                    before the history starts or after it ends. The two boxes also limit each
                    other: "From" can't go past "To", and "To" can't go before "From".
                    The `||` means "use the left side, but if it's empty use the right side", so
                    while "To" is still empty, "From" falls back to the end of the data. */}
                <div className="field-row">
                    <div className="field">
                        <label className="field-label" htmlFor="from">From</label>
                        <input type="date" id="from" name="from" value={plan.from}
                            min={rangeStart} max={plan.to || rangeEnd}
                            onChange={event => onPlanChange("from", event.target.value)} />
                    </div>
                    <div className="field">
                        <label className="field-label" htmlFor="to">To</label>
                        <input type="date" id="to" name="to" value={plan.to}
                            min={plan.from || rangeStart} max={rangeEnd}
                            onChange={event => onPlanChange("to", event.target.value)} />
                    </div>
                </div>

                {/* type="submit" means clicking this (or pressing Enter in a box) submits the
                    form, and App's handleSubmit catches it. `disabled` greys it out until the
                    data is ready, since there's nothing to calculate before that, and the
                    label changes so the person knows why it's greyed out. */}
                <button type="submit" className="btn-primary" disabled={status !== "ready"}>
                    {status === "loading" ? "Loading fund data…" : "Run the numbers"}
                </button>
                <p className={noteClass}>{noteText}</p>
            </fieldset>
        </section>
    );
}