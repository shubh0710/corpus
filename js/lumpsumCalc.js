// Simulates a lumpsum investment: entire amount goes in once, on day 1,
// then just tracks how that one purchase's value moves with the price over time.
export function computeLumpsumSeries(navHistory, amount) {
    const result = []; // fresh array — original navHistory is never touched (pure function)

    for (let i = 0; i < navHistory.length; i++) {
        const newObj = { ...navHistory[i] }; // shallow copy of today's {date, price}

        if (i === 0) {
            // Day 1: the only day a purchase actually happens
            newObj.contributed = true;
            newObj.units = amount / navHistory[i].price; // how many units the lumpsum bought
            newObj.invested = amount;                    // total money put in — fixed forever
            newObj.value = newObj.units * navHistory[i].price;
        } else {
            // Every other day: no new buying, just watching the existing units' worth change
            newObj.contributed = false;
            newObj.units = result[i - 1].units;         // same units as day 1 — nothing new bought
            newObj.invested = result[i - 1].invested;   // still the original amount, unchanged
            newObj.value = newObj.units * navHistory[i].price; // only this moves — today's price × units held
        }

        result.push(newObj);
    }

    return result;
}