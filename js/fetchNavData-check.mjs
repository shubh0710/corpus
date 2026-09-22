import { fetchFundData } from "./fetchNavData.js";

const schemeCode = 147625;

// fetchFundData already re-throws on failure, so this outer catch is what actually
// handles it at the top level, instead of letting the script crash raw.
try {
    // pauses this whole script until fetchFundData finishes, before running the next line
    const result = await fetchFundData(schemeCode);
    console.log(result);
} catch (error) {
    console.error(`Check failed for scheme ${schemeCode}`);

    // Exit codes tell the OS/terminal whether a script succeeded or failed —
    // 0 means "all good" (the default if you don't call this at all),
    // any non-zero number means "something went wrong." Useful later when
    // this script gets called by other tools/automation that need to know
    // pass/fail without reading your console output.
    process.exit(1);
}