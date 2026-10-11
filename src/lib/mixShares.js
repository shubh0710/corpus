// The page and the server keep a mix's shares in two different shapes:
//   the page:   { 118778: 25, 118989: 75 }                  (an object: scheme code -> share)
//   the server: [{ schemeCode: 118778, share: 25 }, ...]     (a list, the code as a number)
// These two turn one shape into the other. Neither checks the numbers: the server does that
// and answers with its own message, so an empty box ("") is passed on as it is.

// Object -> list. Object.entries turns the object into a list of [key, value] pairs:
// [["118778", 25], ["118989", 75]]. An object's keys are always text, so Number() turns
// each code back into a number before it goes into its { schemeCode, share } entry.
export function sharesToList(shares) {
    return Object.entries(shares).map(([code, share]) => ({ schemeCode: Number(code), share }));
}

// List -> object. Each entry becomes a [code, share] pair, and Object.fromEntries builds
// the object back from those pairs (the code becomes a text key again on the way in).
export function listToShares(list) {
    return Object.fromEntries(list.map(entry => [entry.schemeCode, entry.share]));
}