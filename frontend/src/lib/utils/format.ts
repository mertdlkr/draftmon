/**
 * Shared formatting utilities.
 */

/** Shorten a 0x address to "0x1234...abcd" */
export function shortenAddress(addr: string, prefix = 6, suffix = 4): string {
    if (!addr || addr.length < prefix + suffix) return addr;
    return `${addr.slice(0, prefix)}...${addr.slice(-suffix)}`;
}

/** Format a raw ETH/MON string with up to 4 decimal places */
export function formatMon(value: string, decimals = 4): string {
    const n = parseFloat(value);
    if (isNaN(n)) return value;
    return `${n.toFixed(decimals).replace(/\.?0+$/, "")} MON`;
}
