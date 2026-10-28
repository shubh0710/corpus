// Checks fetchNavData.js with a stand-in for fetch, so it runs without a server or internet.
// Run it from the project root:   node src/lib/fetchNavData-check.mjs
import { fetchFundData } from "./fetchNavData.js";

let failures = 0;

function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// The stand-in remembers which address was asked for and answers with nextAnswer
const calls = [];
let nextAnswer = { status: 200, body: { meta: { scheme_code: 147625 }, data: [] } };
globalThis.fetch = async url => {
    calls.push(url);
    return { ok: nextAnswer.status >= 200 && nextAnswer.status < 300, status: nextAnswer.status, json: async () => nextAnswer.body };
};

// fetchFundData prints a line with console.error when it fails. That's useful on the page, but
// here it would look like the check went wrong, so it's switched off while this check runs.
console.error = () => { };

const result = await fetchFundData(147625);
report("asks our own server, not mfapi.in", calls.at(-1), "/api/nav/147625");
report("gives back the server's answer", result.meta.scheme_code, 147625);

nextAnswer = { status: 502, body: { error: "Couldn't reach mfapi.in." } };
let message = "no error";
try {
    await fetchFundData(140088);
} catch (error) {
    message = error.message;
}
report("a bad status throws", message, "Failed to fetch fund data: 502");

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);