// Unit splits: days when a fund cut each unit into smaller pieces. Nothing about the money
// changes, but the price per unit drops by the same factor overnight, which would look like a
// huge crash if we measured it.
//
// Gold BeES split each unit into 100 (face value Rs 100 to Re 1; NSE circular, record date
// 20 Dec 2019). `date` is the first day whose price is already in the new, smaller units.
// Keyed by scheme code, so runBacktest can look a fund up with SPLITS[schemeCode].
export const SPLITS = {
    140088: [{ date: "2019-12-23", ratio: 100 }]
};

// Undoes the splits, so the whole history is in today's (new) units: every price BEFORE a
// split date is divided by that split's ratio. Prices on or after the date are already right.
// splits = [] is a default value: a fund with no splits can leave it out, and then nothing
// changes. Returns a new list; the original is never changed.
export function adjustForSplits(history, splits = []) {
    return history.map(row => {
        let price = row.price;
        for (const split of splits) {
            if (row.date < split.date) {
                price = price / split.ratio;
            }
        }
        return { ...row, price };
    });
}