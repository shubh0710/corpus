// Keeps only the dates that EVERY list has. Funds sometimes skip different days (a fund
// house holiday, a day with no price published), and comparing two lists only makes sense
// when both are measured on exactly the same days.
//
// histories: a list of price lists, like [[{ date, price }, ...], [{ date, price }, ...]].
// Returns new lists in the same order, each trimmed to the shared dates; the originals are
// never changed.
export function keepCommonDates(histories) {
    // Start with every date in the first list. A Set is a bag of unique values that can
    // answer "do you have this?" instantly with .has().
    let shared = new Set(histories[0].map(row => row.date));

    // Then, list by list, keep only the dates that list also has
    for (const history of histories.slice(1)) {
        const dates = new Set(history.map(row => row.date));
        shared = new Set([...shared].filter(date => dates.has(date)));
    }

    return histories.map(history => history.filter(row => shared.has(row.date)));
}