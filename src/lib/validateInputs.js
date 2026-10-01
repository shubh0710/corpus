import { formatDisplayDate } from "./formatDisplayDate.js";

// Takes a date like "2020-02-29" and gives back the same day one year later.
// Feb 29 has no twin the next year, so it lands on Feb 28.
function oneYearAfter(isoDate) {
    const [year, month, day] = isoDate.split("-");
    const nextYear = String(Number(year) + 1).padStart(4, "0");
    if (month === "02" && day === "29") return `${nextYear}-02-28`;
    return `${nextYear}-${month}-${day}`;
}

// Checks what the person chose. Returns {} when all is fine, otherwise only the
// fields that failed: { shares, amount, from, to }, each with one message.
// For each field the first broken rule wins, so the person fixes one thing at a time.
// `range` must exist, so only call this once the fund data has loaded.
export function validateInputs({ shares, plan, range }) {
    const errors = {};

    // ---- shares: whole numbers from 0 to 100, adding up to 100 ----
    // An empty box ("") counts as 0.
    const values = Object.values(shares).map(value => (value === "" ? 0 : value));
    const allWhole = values.every(value => Number.isInteger(value) && value >= 0 && value <= 100);
    if (!allWhole) {
        errors.shares = "Each share must be a whole number from 0 to 100 — fix any box with a decimal, a negative or a number above 100.";
    } else {
        const total = values.reduce((sum, value) => sum + value, 0);
        if (total !== 100) {
            errors.shares = `Shares add up to ${total}% — they need to total 100%.`;
        }
    }

    // ---- amount: a number above 0, from whichever mode is picked ----
    const isSip = plan.style === "sip";
    const amount = isSip ? plan.sipAmount : plan.lumpsumAmount;
    if (!(Number.isFinite(amount) && amount > 0)) {
        errors.amount = isSip
            ? "Enter the amount you'd invest each month — it must be above 0."
            : "Enter the amount you'd invest — it must be above 0.";
    }

    // One year after From ("" while From is empty). Both From and To use it below.
    const fromPlusYear = plan.from ? oneYearAfter(plan.from) : "";

    // ---- from: filled in, not before the data starts, and early enough for a full year ----
    if (!plan.from) {
        errors.from = "Pick a From date.";
    } else if (plan.from < range.start) {
        errors.from = `History only starts on ${formatDisplayDate(range.start)} — pick a From date on or after that.`;
    } else if (fromPlusYear > range.end) {
        // The To box can't go past the end of the data, so the way out is an earlier From
        errors.from = `From must leave at least a year before the data ends on ${formatDisplayDate(range.end)} — pick an earlier From date.`;
    }

    // ---- to: filled in, not after the data ends, after From, and at least a year later ----
    if (!plan.to) {
        errors.to = "Pick a To date.";
    } else if (plan.to > range.end) {
        errors.to = `History only goes up to ${formatDisplayDate(range.end)} — pick a To date on or before that.`;
    } else if (plan.from && fromPlusYear <= range.end) {
        // The two rules that compare with From only apply when From is filled in and
        // early enough to leave a full year. If From is too late, From's own message
        // already says what to fix, and To has nothing useful to add.
        if (plan.to <= plan.from) {
            errors.to = `To must be after ${formatDisplayDate(plan.from)} — pick a later date.`;
        } else if (plan.to < fromPlusYear) {
            errors.to = `The window must be at least 1 year — pick a To date on or after ${formatDisplayDate(fromPlusYear)}.`;
        }
    }

    return errors;
}