// Merges multiple funds' value histories onto one shared calendar, summing
// each fund's value on every date they all have in common.
export function mergeFundSeries(fundSeriesList) {
    const result = [];

    // Convert each fund's array into a Map (date -> value), so we can look up
    // any date instantly later instead of searching through the array every time
    const fundMaps = fundSeriesList.map(series => {
        const map = new Map();
        for (const row of series) {
            map.set(row.date, row.value);
        }
        return map;
    })

    // Funds can start on different dates (different launch dates) — the shared
    // calendar can only begin once every fund actually has data. Find whichever
    // fund started latest; its own date list becomes the calendar we walk.
    let calendarSeries = fundSeriesList[0];

    for (const series of fundSeriesList) {
        if (series[0].date > calendarSeries[0].date) {
            calendarSeries = series; // found a fund that starts even later — take its list instead
        }
    }

    // Walk the shared calendar day by day, adding up every fund's value on that date
    for (const row of calendarSeries) {
        let total = 0;
        for (const map of fundMaps) {
            total += map.get(row.date); // instant lookup — this is why we built the Maps above
        }
        result.push({ date: row.date, total });
    }

    return result;
}