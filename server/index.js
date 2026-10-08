import { app } from "./app.js";

// Open the server for real, on door 3000, and say where to find it.
// The same shape as in health-check.mjs, but with a fixed door instead of 0.
// Express 5 calls this function in two cases: when the door opens, and when it
// can't open (for example, another server already has door 3000). In the second
// case it hands over an error, so we check for that first: throw stops the program
// with the real reason (EADDRINUSE: "address already in use") instead of falsely
// printing "Server running". After a successful start the program keeps running,
// waiting for knocks, until you stop it (Ctrl+C).
app.listen(3000, (error) => {
    if (error) throw error;
    console.log("Server running at http://localhost:3000");
});