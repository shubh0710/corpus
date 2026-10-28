// GET /api/nav/:schemeCode: a fund's full price (NAV) history, fetched from mfapi.in by
// our server and handed to the page.
//
// Why the server does it, not the page: a browser only lets a page read another website's
// answer if that website adds a permission slip (the Access-Control-Allow-Origin header).
// mfapi.in usually does, but in Oct 2026 its cache served Gold BeES's prices without it, and
// the browser blocked them, breaking the whole site. Servers don't follow that browser rule,
// so asking from here always works, and the page only ever talks to its own address.
export async function getNav(req, res) {
    const { schemeCode } = req.params;

    // A scheme code is only digits (like 140088). Anything else is refused, so nobody can use
    // this door to send odd addresses to mfapi.in. /^\d+$/ means "digits from start to end".
    if (!/^\d+$/.test(schemeCode)) {
        return res.status(400).json({ error: "A scheme code is a number." });
    }

    // fetch throws when mfapi.in can't be reached at all; a bad status comes back as
    // response.ok being false. Either way we answer 502 "bad gateway": the problem is the
    // website behind us, not the request the page made.
    let response;
    try {
        response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    } catch {
        return res.status(502).json({ error: "Couldn't reach mfapi.in." });
    }
    if (!response.ok) {
        return res.status(502).json({ error: `mfapi.in answered ${response.status}.` });
    }
    const data = await response.json();

    // Fund prices change once a day (published in the evening), so Vercel may keep a copy of
    // this answer for 6 hours (s-maxage, in seconds) and hand it out without asking mfapi.in
    // again. After that, it may still give the old copy for up to a day while it fetches a
    // fresh one in the background (stale-while-revalidate). Faster pages, fewer requests.
    // Only good answers get this header, so an error is never kept.
    res.set("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
    res.json(data);
}