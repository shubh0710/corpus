import { fetchAllFundsData } from "./fetchAllFunds.js";

try {
    const result = await fetchAllFundsData();

    // Check each fund's response actually matches what we expected — comparing
    // our own hardcoded name against what the API itself reports as the scheme name,
    // plus how much NAV history came back
    for (const fund of result.fundsData) {
        console.log(
            "Expected:", fund.name,
            "| Got:", fund.data.meta.scheme_name,
            "| NAV entries:", fund.data.data.length
        );
    }

    // Same check, separately — benchmarkData isn't inside the fundsData array,
    // so it needs its own log line rather than being swept into the loop above
    console.log(
        "Expected:", result.benchmarkData.name,
        "| Got:", result.benchmarkData.data.meta.scheme_name,
        "| NAV entries:", result.benchmarkData.data.data.length
    );

} catch (error) {
    console.error("fetchAllFundsData check failed:", error.message);
    process.exit(1);
} 