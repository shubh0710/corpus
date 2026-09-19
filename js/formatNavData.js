// Converts "dd-mm-yyyy" → "yyyy-mm-dd" (ISO format), since that's what computeSipSeries expects
function formatToIso(dateStr) {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
}

// Takes the raw JSON straight from the NAV data file and reshapes it into
// the {date, price} array format computeSipSeries needs — also fixes the date
// order (file is newest-first, we need oldest-first)
export function formatNavData(rawJson) {
    return rawJson.data
        .map(item => ({
            date: formatToIso(item.date),
            price: Number(item.nav), // nav comes in as a string in the file, needs to be a number
        }))
        .reverse();
}