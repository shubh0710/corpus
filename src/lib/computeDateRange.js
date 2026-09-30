import { formatNavData } from "./formatNavData.js";

export function computeDateRange(fundsData, benchmarkData) {
    // Put all the funds and the benchmark into one list so we can treat them all the
    // same way. The three dots copy the funds into a new list, which means the
    // original fundsData array is left untouched.
    const allSeries = [...fundsData, benchmarkData];

    // Two empty lists to collect each fund's first date and last date.
    const firstDates = [];
    const lastDates = [];

    // Visit every fund (and the benchmark) one by one.
    for (const item of allSeries) {
        const history = formatNavData(item.data);
        firstDates.push(history[0].date);
        lastDates.push(history[history.length - 1].date);
    }

    // Find the latest of the first dates. reduce() goes through the list keeping a
    // "winner so far" (starting with the first item), and swaps it whenever
    // the next date beats it.
    const start = firstDates.reduce((latest, date) => (date > latest ? date : latest));

    // Same trick the other way round: keep the earliest of the last dates.
    const end = lastDates.reduce((earliest, date) => (date < earliest ? date : earliest));

    return { start, end };
}