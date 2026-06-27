import { stringToBytes, padBytes, bytesToHex } from 'viem'

/** Shorten a 0x address to "0x1234...abcd" */
export function shortenAddress(addr: string, prefix = 6, suffix = 4): string {
  if (!addr || addr.length < prefix + suffix) return addr
  return `${addr.slice(0, prefix)}...${addr.slice(-suffix)}`
}

/** Format a raw ETH/MON wei string (or decimal string) with up to 4 decimal places */
export function formatMon(value: string, decimals = 4): string {
  const n = parseFloat(value)
  if (isNaN(n)) return value
  return `${n.toFixed(decimals).replace(/\.?0+$/, '')} MON`
}

/** Convert a nanoid string to a bytes32 hex — used as roomId on-chain */
export function toBytes32(str: string): `0x${string}` {
  const bytes  = stringToBytes(str)
  const padded = padBytes(bytes, { size: 32 })
  return bytesToHex(padded)
}
