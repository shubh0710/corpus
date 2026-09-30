import { formatDisplayDate } from "./formatDisplayDate.js";

const cases = [
    // the two dates we actually use
    ["2019-09-11", "11 Sep 2019"],
    ["2026-08-19", "19 Aug 2026"],

    // tricky ones: single-digit day, leap day, last day of the year
    ["2020-01-05", "5 Jan 2020"],
    ["2024-02-29", "29 Feb 2024"],
    ["2025-12-31", "31 Dec 2025"],

    // every month once, so a typo in the month list can't hide
    ["2021-01-15", "15 Jan 2021"],
    ["2021-02-15", "15 Feb 2021"],
    ["2021-03-15", "15 Mar 2021"],
    ["2021-04-15", "15 Apr 2021"],
    ["2021-05-15", "15 May 2021"],
    ["2021-06-15", "15 Jun 2021"],
    ["2021-07-15", "15 Jul 2021"],
    ["2021-08-15", "15 Aug 2021"],
    ["2021-09-15", "15 Sep 2021"],
    ["2021-10-15", "15 Oct 2021"],
    ["2021-11-15", "15 Nov 2021"],
    ["2021-12-15", "15 Dec 2021"]
];

let failures = 0;

for (const [input, expected] of cases) {
    const actual = formatDisplayDate(input);
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(input, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);