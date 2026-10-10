// Checks the saved-mix model against a real database, in a practice cabinet (corpus-test)
// so the real data is never touched. Run it from inside server/:
//   node --env-file=.env mix-model-check.mjs
import mongoose from "mongoose";
import { Mix } from "./models/Mix.js";

let failures = 0;

// Prints one line, and counts a failure if the answer isn't what we expect
function report(label, actual, expected) {
    const passed = actual === expected;
    if (!passed) failures++;
    console.log(label, "->", actual, passed ? "PASS" : `FAIL (expected ${expected})`);
}

// The mix we save and expect to get back exactly
const shares = [
    { schemeCode: 118778, share: 50 },
    { schemeCode: 119028, share: 30 },
    { schemeCode: 140088, share: 20 }
];

// Every mix needs an owner: the ID of the user it belongs to. new mongoose.Types.ObjectId()
// makes up a fresh, correctly shaped ID; no real user is needed for this check.
const owner = new mongoose.Types.ObjectId();

// The practice cabinet: dbName "corpus-test" overrides the "corpus" in the address
await mongoose.connect(process.env.MONGODB_URI, { dbName: "corpus-test" });

// try / finally: whatever happens, finally hangs up on the database, so the check ends by itself
try {
    // Save a mix, then read it back by its _id (the ID the database gave it)
    const saved = await Mix.create({ name: "Check mix", shares, owner });
    const found = await Mix.findById(saved._id);
    report("name", found.name, "Check mix");
    // toObject turns the Mongoose document into a plain object; JSON.stringify turns both
    // lists into text, so two lists with the same pairs in the same order compare equal
    report("shares", JSON.stringify(found.toObject().shares), JSON.stringify(shares));

    // A mix with no name must be refused. validate() checks the rules without saving,
    // so even if the rule is broken, nothing junk ends up in the database.
    // It has an owner, so the missing name is the only thing that can make it fail.
    let errorName = "no error";
    try {
        await new Mix({ shares, owner }).validate();
    } catch (error) {
        errorName = error.name;
    }
    report("a mix with no name is refused", errorName, "ValidationError");

    // Clean up: delete the mix we saved
    const result = await Mix.deleteOne({ _id: saved._id });
    report("cleaned up", result.deletedCount, 1);

    console.log(failures === 0 ? "ALL PASS" : `${failures} FAILED`);
} finally {
    await mongoose.disconnect();
}