// Two data series (e.g. your fund vs a benchmark index) can start on different
// dates. Before comparing them, both need to start from the same date —
// this trims off whichever series has "extra" early history the other lacks.
export function alignSeries(seriesA, seriesB) {
    // The shared start has to be the LATER of the two start dates — you can't
    // compare a fund against a benchmark on a day the benchmark didn't exist yet
    const sharedStart = seriesA[0].date > seriesB[0].date ? seriesA[0].date : seriesB[0].date;

    // Keep only rows on or after the shared start date (>= keeps that date itself, not just after it)
    const trimmedA = seriesA.filter(row => row.date >= sharedStart);
    const trimmedB = seriesB.filter(row => row.date >= sharedStart);

    return [trimmedA, trimmedB];
}