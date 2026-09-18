// Calculates a SIP (Systematic Investment Plan) purchase history.
// For each date in navHistory, figures out if a contribution happened that day,
// and tracks running totals for units owned, money invested, and current value.
export function computeSipSeries(navHistory, sipDate, sipAmount) {
    const result = [];      // output array — never touches the original navHistory (pure function)
    const seenMonths = {};  // tracks which months already got their SIP contribution

    for (let i = 0; i < navHistory.length; i++) {
        const newObj = { ...navHistory[i] }; // shallow copy, so original object isn't mutated

        // Day 1 always counts as a contribution, no matter what sipDate is
        if (i === 0) {
            newObj.contributed = true;
            newObj.units = sipAmount / navHistory[i].price;
            newObj.invested = sipAmount;
            newObj.value = newObj.units * navHistory[i].price;

            const dayNum = Number(newObj.date.slice(8, 10));    // e.g. "2024-01-08" → 8
            const monthKey = newObj.date.slice(0, 7);           // e.g. "2024-01-08" → "2024-01"

            // If day 1 also happens to be on/after sipDate, this month is already "used up" —
            // stops a second contribution landing later in the same month
            if (dayNum >= sipDate) {
                seenMonths[monthKey] = true;
            }
        }

        // Every other day: check if this is the first eligible SIP date in its month
        if (i !== 0) {
            const dayNum = Number(newObj.date.slice(8, 10));
            const monthKey = newObj.date.slice(0, 7);

            if (dayNum >= sipDate && !seenMonths[monthKey]) {
                // First day this month that's on/after sipDate — contribution happens
                newObj.contributed = true;
                newObj.units = sipAmount / navHistory[i].price + result[i - 1].units;
                newObj.invested = sipAmount + result[i - 1].invested;
                newObj.value = newObj.units * navHistory[i].price;
                seenMonths[monthKey] = true; // lock this month, no more contributions till next month
            } else {
                // No contribution today — carry forward units/invested, only value moves with price
                newObj.contributed = false;
                newObj.units = result[i - 1].units;
                newObj.invested = result[i - 1].invested;
                newObj.value = newObj.units * navHistory[i].price;
            }
        }

        result.push(newObj);
    }

    return result;
}

// Converts "dd-mm-yyyy" → "yyyy-mm-dd" (ISO format), since that's what computeSipSeries expects
function formatToIso(dateStr) {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
}

// Takes the raw JSON straight from the NAV data file and reshapes it into
// the {date, price} array format computeSipSeries needs — also fixes the date
// order (file is newest-first, we need oldest-first)
export function loadNavData(rawJson) {
    return rawJson.data
        .map(item => ({
            date: formatToIso(item.date),
            price: Number(item.nav), // nav comes in as a string in the file, needs to be a number
        }))
        .reverse();
}