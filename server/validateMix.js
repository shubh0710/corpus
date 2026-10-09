// The guard's checklist for a mix someone wants to save: { name, shares: [{ schemeCode, share }] }.
// Returns null when everything is fine, otherwise ONE message: the first rule that's broken,
// checked in order, so the person fixes one thing at a time (like the page's validateInputs).
// It never trusts what arrives: anything could be sent, not only what our page sends.
export function validateMix(body) {
    const { name, shares } = body;

    // 1. The name is text, and not empty once the spaces at the ends are trimmed away.
    //    typeof says what kind of thing a value is: "string" for text, "number" for numbers.
    if (typeof name !== "string" || name.trim() === "") {
        return "Give the mix a name.";
    }

    // 2. The shares are a list with at least one entry. Array.isArray is the way to ask
    //    "is this a list?": typeof says "object" for both lists and objects, so it can't tell.
    if (!Array.isArray(shares) || shares.length === 0) {
        return "Add at least one fund.";
    }

    // 3. Every entry's scheme code is a number. .every asks "is this true for all of them?"
    if (!shares.every(entry => typeof entry.schemeCode === "number")) {
        return "Each fund needs a scheme code.";
    }

    // 4. Every share is a whole number from 0 to 100 (the same message as the page)
    if (!shares.every(entry => Number.isInteger(entry.share) && entry.share >= 0 && entry.share <= 100)) {
        return "Each share must be a whole number from 0 to 100 — fix any box with a decimal, a negative or a number above 100.";
    }

    // 5. The shares total exactly 100 (the same message as the page)
    const total = shares.reduce((sum, entry) => sum + entry.share, 0);
    if (total !== 100) {
        return `Shares add up to ${total}% — they need to total 100%.`;
    }

    // Every rule passed
    return null;
}