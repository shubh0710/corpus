// Fetches a fund's full NAV history from the mfapi.in public API, given its scheme code.
// "async" means this function does something that takes time (a network request) —
// it doesn't block the rest of the program while waiting.
export async function fetchFundData(schemeCode) {
    try {
        // "await" pauses HERE until the API responds — like waiting for a reply
        // before reading the next line, instead of moving on immediately.
        // Template literal builds the URL with the scheme code plugged in.
        const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);

        // fetch() only throws an error for things like "no internet" — a bad
        // response (404, 500, etc.) still counts as "success" to fetch itself.
        // response.ok is true only for successful status codes (200-299) —
        // this check catches the case fetch() alone would silently miss.
        if (!response.ok) {
            throw new Error(`Failed to fetch fund data: ${response.status}`);
        }

        // The response arrives as raw data first — .json() reads and converts
        // it into an actual usable JS object
        const result = await response.json();
        return result;

    } catch (error) {
        // Catches anything that went wrong above — network failure, bad status,
        // or a broken response. Logs a clear message, including which scheme failed.
        console.error(`fetchFundData failed for scheme ${schemeCode}:`, error.message);

        // Re-throw so whoever called this function also finds out it failed,
        // instead of silently continuing with no data
        throw error;
    }
}