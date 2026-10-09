// Checks the saved-mixes doors (POST, GET and DELETE /api/mixes) against a real database, in the
// practice cabinet (corpus-test). Run it from inside server/:
//   node --env-file=.env mixes-api-check.mjs
import mongoose from "mongoose";
import { app } from "./app.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// The practice cabinet: dbName "corpus-test" overrides the "corpus" in the address
await mongoose.connect(process.env.MONGODB_URI, { dbName: "corpus-test" });

// Open the server on any free door, then knock on it from inside
const server = app.listen(0, async () => {
    // try / finally: whatever happens, finally closes the door and hangs up on the database
    try {
        const address = `http://localhost:${server.address().port}/api/mixes`;

        // ---- save a good mix ----
        // method: "POST" says "here is something to save". The header tells the server the
        // package is JSON, and JSON.stringify packs the object into JSON text.
        const goodMix = {
            name: "API check mix",
            shares: [
                { schemeCode: 118778, share: 60 },
                { schemeCode: 140088, share: 40 }
            ]
        };
        const saveResponse = await fetch(address, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(goodMix)
        });
        const saved = await saveResponse.json();
        report("POST a good mix: status", saveResponse.status, 201);
        report("POST a good mix: it has an _id", typeof saved._id, "string");
        report("POST a good mix: name", saved.name, goodMix.name);

        // ---- the list contains it ----
        // .some asks "is there at least one mix in the list with this _id?"
        const listResponse = await fetch(address);
        const list = await listResponse.json();
        report("GET the list: status", listResponse.status, 200);
        report("GET the list: our mix is in it", list.some(mix => mix._id === saved._id), true);

        // ---- a mix that totals 90 is refused ----
        const badResponse = await fetch(address, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Bad mix",
                shares: [
                    { schemeCode: 118778, share: 50 },
                    { schemeCode: 140088, share: 40 }
                ]
            })
        });
        const bad = await badResponse.json();
        report("POST a mix totalling 90: status", badResponse.status, 400);
        report("POST a mix totalling 90: error", bad.error, "Shares add up to 90% — they need to total 100%.");

        // ---- delete it through the DELETE door (this also cleans up) ----
        // The mix's _id goes at the end of the address. A 204 answer has no body, so we
        // only look at its status, and don't call .json() on it.
        const deleteResponse = await fetch(`${address}/${saved._id}`, { method: "DELETE" });
        report("DELETE our mix: status", deleteResponse.status, 204);

        // Deleting the same mix again: it's gone, so 404 "not found" with a message
        const againResponse = await fetch(`${address}/${saved._id}`, { method: "DELETE" });
        report("DELETE it again: status", againResponse.status, 404);
        const again = await againResponse.json();
        report("DELETE it again: error", again.error, "Mix not found");

        // And the list no longer has it
        const afterResponse = await fetch(address);
        const after = await afterResponse.json();
        report("GET the list again: our mix is gone", after.some(mix => mix._id === saved._id), false);

        console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);
    } finally {
        server.close();
        await mongoose.disconnect();
    }
});