const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Turns a date like "2019-09-11" into something friendlier to read: "11 Sep 2019".
// We build the text by hand instead of using new Date(...) on purpose. Date can
// shift the day by one in some time zones, and in some countries it prints "Sept"
// instead of "Sep". Splitting the text ourselves gives the same answer everywhere.
export function formatDisplayDate(isoDate) {
    // split("-") cuts the text at every dash, so "2019-09-11" becomes
    // ["2019", "09", "11"]. The square brackets on the left then hand those
    // three pieces to three separate names: year, month and day.
    const [year, month, day] = isoDate.split("-");

    // Number(day) turns "09" into the number 9, which drops the leading zero, so we
    // get "9 Sep" rather than "09 Sep". For the month, Number(month) - 1 is its
    // position in MONTH_NAMES: September is month 9, so 9 - 1 = 8, and position 8 is "Sep".
    // The year needs no change.
    return `${Number(day)} ${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

// The same, without the day: "2019-09-11" becomes "Sep 2019". It is for places that only
// need the month and year, like the window "Sep 2019 — Aug 2026" on Card 3.
export function formatMonthYear(isoDate) {
    // The day isn't needed, so we only name the first two pieces. split("-") still
    // makes three, and the third is simply left unused.
    const [year, month] = isoDate.split("-");

    // Same trick as above: month "09" is the number 9, and the list starts counting
    // at 0, so position 9 - 1 = 8 is "Sep".
    return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}