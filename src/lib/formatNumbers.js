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

// India counts in lakhs and crores, not millions. They are named here so the zeros
// are counted once, not typed again each time they are needed.
const LAKH = 100000;      // 1,00,000
const CRORE = 10000000;   // 1,00,00,000

// A short form of a rupee amount, for tight spaces like the chart's axis:
// 160000 becomes "₹1.6L" (L is lakh), 12000000 becomes "₹1.2Cr" (Cr is crore), and
// anything under a lakh counts in thousands: 80000 becomes "₹80K".
export function formatCompactRupees(amount) {
    // Zero has no unit, so without this line it would come out as "₹0K"
    if (amount === 0) return "₹0";

    // Pick the biggest unit that fits, checking from the biggest down.
    // unit is how much one step is worth, letter is what we write after the number.
    let unit, letter;
    if (amount >= CRORE) {
        unit = CRORE;
        letter = "Cr";
    } else if (amount >= LAKH) {
        unit = LAKH;
        letter = "L";
    } else {
        unit = 1000;
        letter = "K";
    }

    // Divide by the unit (250000 / 100000 is 2.5), round to one digit after the point,
    // then turn that text back into a number. toFixed(1) gives the text "3.0" for 3, and
    // Number("3.0") is just 3, so the useless ".0" disappears: "₹3L", not "₹3.0L".
    return "₹" + Number((amount / unit).toFixed(1)) + letter;
}