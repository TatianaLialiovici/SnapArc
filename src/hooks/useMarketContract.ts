"use client";

import { useAccount } from "wagmi";
import { MARKET_ABI, MARKET_BYTECODE } from "@/lib/contract";
import { useContractAddress } from "./useContractAddress";

export function useMarketContract() {
  const { address } = useContractAddress();
  const { isConnected } = useAccount();
  return {
    address: address ?? undefined,
    abi: MARKET_ABI,
    bytecode: MARKET_BYTECODE,
    enabled: !!address && isConnected,
  };
}

export { useContractAddress };
