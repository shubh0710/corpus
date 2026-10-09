import mongoose from "mongoose";
import { app } from "./app.js";

// First unlock the vault: connect to the database at the address in .env
// (process.env.MONGODB_URI). Connecting takes a moment, so connect gives back a
// promise and we await it, exactly like fetch. This await sits straight in the
// file, outside any function: in an ES module file ("type": "module") that's
// allowed, and Node simply pauses the file here until the connection is open.
// If it can't connect (wrong password, this computer's IP not allowed in Atlas),
// the await throws and the program stops with the real reason. That's what we
// want, so there's no try/catch. A blocked IP can take about 30 seconds to fail.
await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to MongoDB");

// Only then open the door: a bank doesn't open before the vault is unlocked.
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