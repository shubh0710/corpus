// Checks the server's health route: GET /api/health should answer 200 with { "status": "ok" }.
// Run it from inside server/:   node health-check.mjs
import { app } from "./app.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// Open the server on any free door (0 means "the computer picks a free port"), so this
// never clashes with a dev server already running on 3000. Express runs the function
// once the door is actually open. `server` is the open door itself.
const server = app.listen(0, async () => {
    // try / finally: whatever happens inside try, finally still runs and closes the door.
    // Without that, a crash would leave the server open and the check would never end.
    try {
        // Which door did the computer pick? A number like 53817.
        const port = server.address().port;

        // Knock on the health door, just like the front end fetches from mfapi.in
        const response = await fetch(`http://localhost:${port}/api/health`);
        report("status code", response.status, 200);

        // The answer's body is JSON text; .json() turns it into an object
        const body = await response.json();
        report("body.status", body.status, "ok");

        console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);
    } finally {
        // Lock the shop at night, whether the day went well or badly
        server.close();
    }
});