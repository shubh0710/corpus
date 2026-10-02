// The true minus sign. It is a different character from the hyphen on the keyboard ("-"):
// it is wider and sits at the height of the plus sign, so "−24.6%" looks right in a table.
// We write it by its code (\u2212) so it can't be swapped for a hyphen by accident.
const TRUE_MINUS = "\u2212";

// Turns a plain number into rupees the way India writes them: 415000 becomes "₹4,15,000".
export function formatRupees(amount) {
    return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

// Turns a fraction into a percentage: 0.184 becomes "18.4%".
// `decimals` is how many digits to show after the point, and it is 1 unless you say otherwise.
// value * 100 moves the fraction into percent. toFixed(decimals) then rounds to that many
// digits and keeps the zeros ("30.0"), so numbers in a column line up. A negative number
// comes out of toFixed with a hyphen in front, and replace swaps that for the true minus.
export function formatPercent(value, decimals = 1) {
    return (value * 100).toFixed(decimals).replace("-", TRUE_MINUS) + "%";
}