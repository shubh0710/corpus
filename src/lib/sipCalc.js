// Builds the day-by-day story of a monthly SIP: on every date, how many units you hold,
// how much money you've put in so far, and what it's all worth.
//
// The rule real fund houses follow: each month's instalment is due on the SIP day. If that
// day isn't a trading day (a weekend or a holiday), it's paid on the next trading day, even
// when that falls in the next month. The money is never skipped. For example, a SIP on the
// 28th in February 2021 (the 28th was a Sunday) is paid on Monday 1 March, and March's own
// instalment is still paid later that month.

// The SIP day in the month after `dueDate`, as text: ("2021-01-28", 28) gives "2021-02-28".
// It counts from the date the instalment was DUE, not the day it was actually paid, so one
// late payment never pushes the following months later too.
function nextDueDate(dueDate, sipDay) {
    let year = Number(dueDate.slice(0, 4));
    let month = Number(dueDate.slice(5, 7)) + 1;
    // December's next month is January of the following year
    if (month === 13) {
        month = 1;
        year += 1;
    }
    // padStart adds a leading zero where needed, so 3 becomes "03" and the text stays in
    // the "YYYY-MM-DD" shape that the date comparisons below rely on
    return `${year}-${String(month).padStart(2, "0")}-${String(sipDay).padStart(2, "0")}`;
}

// navHistory: [{ date, price }], oldest first, trading days only.
// sipDay:     the day of the month the SIP is due (1 to 28).
// sipAmount:  the money put in each month.
// firstDue:   when the first instalment is due. Left out, it's the first day of the history.
//             runBacktest passes the From date the person picked, which matters when From is
//             itself a holiday: the first instalment is then paid on the next trading day, and
//             the second is still due in From's next month.
// Returns a new list; the original navHistory is never changed.
export function computeSipSeries(navHistory, sipDay, sipAmount, firstDue = navHistory[0].date) {
    const result = [];
    let due = firstDue;
    let units = 0;
    let invested = 0;

    for (const row of navHistory) {
        // ISO dates ("2021-03-01") sort the same way as text and as dates, so a plain >=
        // asks "is today on or after the due date?"
        const contributed = row.date >= due;
        if (contributed) {
            units += sipAmount / row.price;   // today's instalment buys units at today's price
            invested += sipAmount;
            due = nextDueDate(due, sipDay);   // and the next instalment falls due a month later
        }
        // {...row} copies date and price, then the day's numbers are added on top
        result.push({ ...row, contributed, units, invested, value: units * row.price });
    }

    return result;
}