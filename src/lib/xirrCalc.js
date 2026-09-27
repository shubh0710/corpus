// Finds the XIRR — the single annualized rate that makes this list of
// cashflows (money in, money out, at different dates) balance to zero.
// There's no direct formula for this, so we search for it using binary search.
export function computeXIRR(cashflows) {
    const day0 = new Date(cashflows[0].date); // reference point — day 0
    const msPerDay = 1000 * 60 * 60 * 24;

    // How many days each cashflow happened after day0
    const days = cashflows.map(cf => (new Date(cf.date) - day0) / msPerDay);

    // Given a guessed annual rate, check how well the cashflows balance out.
    // Positive result = money in outweighs money out (rate guess too low/optimistic).
    // Negative result = overcorrected (rate guess too high/pessimistic).
    // Zero (or close to it) = this rate is the answer.
    function npv(rate) {
        let sum = 0;
        for (let i = 0; i < cashflows.length; i++) {
            sum += cashflows[i].amount / (1 + rate) ** (days[i] / 365);
        }
        return sum;
    }

    // Search range: -99% to +1000% annualized — wide enough to cover any
    // realistic SIP outcome, without hitting the math-breaking edge at -100%.
    let lo = -0.99;
    let hi = 10;

    // Binary search: each loop cuts the search range in half, homing in on
    // the rate where npv(rate) crosses zero. 200 rounds is far more than
    // needed for floating-point precision, but simple and safe either way.
    for (let iter = 0; iter < 200; iter++) {
        const mid = (lo + hi) / 2;

        if (npv(mid) > 0) {
            lo = mid; // still positive → guess wasn't harsh enough → search higher half
        } else {
            hi = mid; // went negative → guess was too harsh → search lower half
        }
    }

    // lo and hi have converged to (essentially) the same number — either works
    return (lo + hi) / 2;
}