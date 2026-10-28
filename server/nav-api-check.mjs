// Checks the fund-price door, GET /api/nav/:schemeCode, without touching the real mfapi.in:
// calls to mfapi.in go to a stand-in we control, so we can also test what happens when it fails.
// Run it from inside server/:   node nav-api-check.mjs
import { app } from "./app.js";

let failures = 0;

function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// ---- the stand-in for mfapi.in ----
// The check itself also uses fetch, to knock on our own server, so we keep the real fetch
// and only answer calls to mfapi.in ourselves.
const realFetch = globalThis.fetch;
const mfapiCalls = [];
let mfapiAnswer = { status: 200, body: { meta: { scheme_code: 140088 }, data: [{ date: "23-12-2019", nav: "33.73130" }] } };
globalThis.fetch = async (url, options) => {
    if (!String(url).startsWith("https://api.mfapi.in/")) {
        return realFetch(url, options);
    }
    mfapiCalls.push(url);
    if (mfapiAnswer.unreachable) {
        throw new TypeError("fetch failed");
    }
    return {
        ok: mfapiAnswer.status >= 200 && mfapiAnswer.status < 300,
        status: mfapiAnswer.status,
        json: async () => mfapiAnswer.body
    };
};

const server = app.listen(0, async () => {
    try {
        const base = `http://localhost:${server.address().port}/api/nav`;

        // ---- a good answer is passed straight through ----
        let response = await fetch(`${base}/140088`);
        report("good code: status", response.status, 200);
        report("asks mfapi.in for that fund", mfapiCalls.at(-1), "https://api.mfapi.in/mf/140088");
        const body = await response.json();
        report("passes mfapi.in's answer through", body.data[0].nav, "33.73130");
        report("Vercel may keep it for 6 hours", response.headers.get("cache-control"),
            "public, s-maxage=21600, stale-while-revalidate=86400");

        // ---- not a number: refused, and mfapi.in is never asked ----
        const callsBefore = mfapiCalls.length;
        response = await fetch(`${base}/abc`);
        report("letters: status 400", response.status, 400);
        report("letters: mfapi.in not asked", mfapiCalls.length, callsBefore);

        // ---- mfapi.in answers with an error ----
        mfapiAnswer = { status: 500 };
        response = await fetch(`${base}/140088`);
        report("mfapi.in error: status 502", response.status, 502);
        report("mfapi.in error: the answer isn't kept", response.headers.get("cache-control"), null);

        // ---- mfapi.in can't be reached at all ----
        mfapiAnswer = { unreachable: true };
        response = await fetch(`${base}/140088`);
        report("mfapi.in unreachable: status 502", response.status, 502);
        report("mfapi.in unreachable: message", (await response.json()).error, "Couldn't reach mfapi.in.");
    } finally {
        server.close();
    }
    console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);
});