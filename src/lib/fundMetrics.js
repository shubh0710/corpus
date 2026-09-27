export function computeFundMetrics(navHistory) {
    const first = navHistory[0];
    const last = navHistory[navHistory.length - 1];

    // Convert date strings into real Date objects so we can do math on them
    const firstDate = new Date(first.date);
    const lastDate = new Date(last.date);

    // Figure out how many real calendar years this data spans —
    // needed to annualize risk and CAGR later
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = (lastDate - firstDate) / msPerDay;
    const years = totalDays / 365;

    // --- Daily returns: % price change from one day to the next ---
    const dailyReturns = [];

    for (let i = 1; i < navHistory.length; i++) {
        const todayPrice = navHistory[i].price;
        const yesterdayPrice = navHistory[i - 1].price;
        dailyReturns.push((todayPrice - yesterdayPrice) / yesterdayPrice);
    }

    // --- Risk: annualized volatility (sample standard deviation of daily returns) ---
    const mean = dailyReturns.reduce((sum, x) => sum + x, 0) / dailyReturns.length;
    const squaredDiffs = dailyReturns.map(x => (x - mean) ** 2);
    const variance = squaredDiffs.reduce((sum, x) => sum + x, 0) / (dailyReturns.length - 1);
    const stdDev = Math.sqrt(variance);
    const risk = stdDev * Math.sqrt(navHistory.length / years);

    // --- Max drawdown: worst drop from any all-time-high to a later low ---
    let peak = first.price;     // highest price seen so far, updated as we go
    let worstDrawdown = 0;      // most negative drawdown found so far
    for (const row of navHistory) {
        if (row.price > peak) {
            peak = row.price; // new all-time high — update the reference point
        }
        const dd = (row.price - peak) / peak; // how far below the peak are we today (always ≤ 0)
        if (dd < worstDrawdown) {
            worstDrawdown = dd; // track the deepest drop found so far
        }
    }
    const maxDrawdown = -worstDrawdown; // flip to a positive number for display

    // --- CAGR: the steady yearly growth rate that gets you from first price to last ---
    const firstPrice = first.price;
    const lastPrice = last.price;
    const cagr = ((lastPrice / firstPrice) ** (1 / years)) - 1;

    return { risk, maxDrawdown, cagr };
}