// Checks the saved-mixes doors (POST, GET and DELETE /api/mixes) against a real database, in the
// practice cabinet (corpus-test). Every door needs a wristband now, and each person only
// sees and deletes their own mixes. Run it from inside server/:
//   node --env-file=.env mixes-api-check.mjs
import mongoose from "mongoose";
import { app } from "./app.js";
import { User } from "./models/User.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// Two fresh people every run (Date.now() is different every millisecond)
const stamp = Date.now();
const emailA = `mixes-a-${stamp}@example.com`;
const emailB = `mixes-b-${stamp}@example.com`;

// The practice cabinet: dbName "corpus-test" overrides the "corpus" in the address
await mongoose.connect(process.env.MONGODB_URI, { dbName: "corpus-test" });

// Open the server on any free door, then knock on it from inside
const server = app.listen(0, async () => {
    // try / finally: whatever happens, finally cleans up, closes the door and hangs up
    try {
        const api = `http://localhost:${server.address().port}/api`;
        const address = `${api}/mixes`;

        // Signs someone up through the real sign-up door and gives back their wristband (token)
        async function signUp(email) {
            const response = await fetch(`${api}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: "longenough" })
            });
            const answer = await response.json();
            return answer.token;
        }

        // Knocks on a mixes door wearing someone's wristband. JSON.stringify(undefined) is
        // undefined, so a knock with no package (GET, DELETE) simply sends no body.
        function knock(token, method, url, body) {
            return fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        }

        const tokenA = await signUp(emailA);
        const tokenB = await signUp(emailB);

        // ---- no wristband: turned away ----
        const strangerResponse = await fetch(address);
        report("GET with no token: status", strangerResponse.status, 401);

        // ---- A saves a good mix ----
        const goodMix = {
            name: "API check mix",
            shares: [
                { schemeCode: 118778, share: 60 },
                { schemeCode: 140088, share: 40 }
            ]
        };
        const saveResponse = await knock(tokenA, "POST", address, goodMix);
        report("A saves a good mix: status", saveResponse.status, 201);
        const saved = await saveResponse.json();
        report("A saves a good mix: it has an _id", typeof saved._id, "string");
        report("A saves a good mix: name", saved.name, goodMix.name);

        // ---- A's list has it, B's list doesn't ----
        // .some asks "is there at least one mix in the list with this _id?"
        const listAResponse = await knock(tokenA, "GET", address);
        report("A's list: status", listAResponse.status, 200);
        const listA = await listAResponse.json();
        report("A's list: our mix is in it", listA.some(mix => mix._id === saved._id), true);

        const listBResponse = await knock(tokenB, "GET", address);
        const listB = await listBResponse.json();
        report("B's list: A's mix is not in it", listB.some(mix => mix._id === saved._id), false);

        // ---- a mix that totals 90 is refused ----
        const badResponse = await knock(tokenA, "POST", address, {
            name: "Bad mix",
            shares: [
                { schemeCode: 118778, share: 50 },
                { schemeCode: 140088, share: 40 }
            ]
        });
        report("A saves a mix totalling 90: status", badResponse.status, 400);
        const bad = await badResponse.json();
        report("A saves a mix totalling 90: error", bad.error, "Shares add up to 90% — they need to total 100%.");

        // ---- B tries to delete A's mix: as far as B is concerned, it doesn't exist ----
        const bDeleteResponse = await knock(tokenB, "DELETE", `${address}/${saved._id}`);
        report("B deletes A's mix: status", bDeleteResponse.status, 404);

        // ---- A deletes it (this also cleans up). A 204 has no body, so no .json() ----
        const deleteResponse = await knock(tokenA, "DELETE", `${address}/${saved._id}`);
        report("A deletes the mix: status", deleteResponse.status, 204);

        // Deleting the same mix again: it's gone, so 404 "not found" with a message
        const againResponse = await knock(tokenA, "DELETE", `${address}/${saved._id}`);
        report("A deletes it again: status", againResponse.status, 404);
        const again = await againResponse.json();
        report("A deletes it again: error", again.error, "Mix not found");

        // And A's list no longer has it
        const afterResponse = await knock(tokenA, "GET", address);
        const after = await afterResponse.json();
        report("A's list again: our mix is gone", after.some(mix => mix._id === saved._id), false);

        console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);
    } finally {
        // Remove both practice people, then close the door and hang up
        await User.deleteOne({ email: emailA });
        await User.deleteOne({ email: emailB });
        server.close();
        await mongoose.disconnect();
    }
});