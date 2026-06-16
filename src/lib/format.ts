import { formatEther, parseEther } from "viem";

export const MIN_PRICE_USDC = 0.10;
export const MAX_PRICE_USDC = 0.50;

export const MIN_PRICE_WEI = parseEther(String(MIN_PRICE_USDC));
export const MAX_PRICE_WEI = parseEther(String(MAX_PRICE_USDC));

export function formatUsdc(value: bigint): string {
  return `${formatEther(value)} USDC`;
}

export function parseUsdc(value: string): bigint {
  return parseEther(value);
}

export function formatDate(timestamp: number | bigint): string {
  const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
  return new Date(ts * 1000).toLocaleString();
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
