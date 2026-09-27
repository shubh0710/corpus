import { fetchAllFundsData } from "./fetchAllFunds.js";
import { formatNavData } from "./formatNavData.js";
import { computeSipSeries } from "./sipCalc.js";

try {
    const result = await fetchAllFundsData();

    // Just trace one fund through the whole chain
    const oneFund = result.fundsData[0];

    const navHistory = formatNavData(oneFund.data);

    // Checking both first AND last also confirms the array is genuinely
    // ordered oldest → newest, not accidentally reversed.
    console.log("First entry:", navHistory[0]);
    console.log("Last entry:", navHistory[navHistory.length - 1]);

    // Only proceed to the SIP calculation once the checkpoint above looks correct
    const sipResult = computeSipSeries(navHistory, 5, 1000);
    const lastEntry = sipResult[sipResult.length - 1];

    console.log(`Fund: ${oneFund.name}`);
    console.log(`Units: ${lastEntry.units}, Invested: ₹${lastEntry.invested}, Value: ₹${lastEntry.value}`);

} catch (error) {
    console.error("live-pipeline-check failed:", error.message);
    process.exit(1);
}