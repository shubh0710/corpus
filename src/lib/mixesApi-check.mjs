// Checks mixesApi.js (the page's helpers for saving, listing and deleting mixes) without a
// server: the real fetch is swapped for a stunt double we control.
// Run it from the project root:   node src/lib/mixesApi-check.mjs
import { saveMix, listMixes, deleteMix } from "./mixesApi.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// ---- the stunt double (the same as in authApi-check.mjs, plus the 204 rule) ----
const calls = [];                                  // remembers every knock, so we can inspect it
let nextAnswer = { status: 200, body: {} };        // what the fake will "reply" next

// Like a real response: ok (true for 200-299), status, and json() giving back the body.
// A 204 "No Content" answer has an empty body, so here, as with a real one, json() throws.
globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
        ok: nextAnswer.status >= 200 && nextAnswer.status < 300,
        status: nextAnswer.status,
        json: async () => {
            if (nextAnswer.status === 204) {
                throw new SyntaxError("Failed to execute 'json' on 'Response': Unexpected end of JSON input");
            }
            return nextAnswer.body;
        }
    };
};

// .at(-1) is the last item in a list: the knock that just happened
function lastCall() {
    return calls.at(-1);
}

const token = "abc";
const list = [
    { schemeCode: 118778, share: 60 },
    { schemeCode: 118989, share: 40 }
];

// ---- saveMix ----
nextAnswer = { status: 201, body: { _id: "m1", name: "My mix", shares: list } };
const saved = await saveMix(token, "My mix", list);
report("saveMix: URL", lastCall().url, "/api/mixes");
report("saveMix: method", lastCall().options.method, "POST");
report("saveMix: Authorization header", lastCall().options.headers.Authorization, "Bearer abc");
report("saveMix: Content-Type", lastCall().options.headers["Content-Type"], "application/json");
// The body travels as JSON text; JSON.parse turns it back into an object we can look inside
const sent = JSON.parse(lastCall().options.body);
report("saveMix: body name", sent.name, "My mix");
report("saveMix: body shares", JSON.stringify(sent.shares), JSON.stringify(list));
report("saveMix: gives back the saved mix", saved._id, "m1");

// ---- saveMix, 400 answer: it throws, with the server's own words ----
nextAnswer = { status: 400, body: { error: "Give the mix a name." } };
let message = "no error";
try {
    await saveMix(token, "", list);
} catch (error) {
    message = error.message;
}
report("saveMix 400: throws the server's message", message, "Give the mix a name.");

// ---- listMixes ----
const mixes = [{ _id: "m2", name: "Newer" }, { _id: "m1", name: "My mix" }];
nextAnswer = { status: 200, body: mixes };
const listed = await listMixes(token);
report("listMixes: URL", lastCall().url, "/api/mixes");
report("listMixes: Authorization header", lastCall().options.headers.Authorization, "Bearer abc");
report("listMixes: gives back the list", JSON.stringify(listed), JSON.stringify(mixes));

// ---- deleteMix, 204 answer: done, nothing to read, and NOT an error ----
nextAnswer = { status: 204 };
message = "no error";
try {
    await deleteMix(token, "m1");
} catch (error) {
    message = error.message;
}
report("deleteMix: URL", lastCall().url, "/api/mixes/m1");
report("deleteMix: method", lastCall().options.method, "DELETE");
report("deleteMix: Authorization header", lastCall().options.headers.Authorization, "Bearer abc");
report("deleteMix 204: no error", message, "no error");

// ---- deleteMix, 404 answer ----
nextAnswer = { status: 404, body: { error: "Mix not found" } };
message = "no error";
try {
    await deleteMix(token, "m1");
} catch (error) {
    message = error.message;
}
report("deleteMix 404: throws the server's message", message, "Mix not found");

console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);