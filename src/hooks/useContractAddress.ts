"use client";

import { useEffect, useState } from "react";

export interface ContractConfig {
  address: `0x${string}` | null;
}

export function useContractAddress(): {
  address: `0x${string}` | null | undefined;
  isLoading: boolean;
  reload: () => void;
} {
  const [address, setAddress] = useState<`0x${string}` | null | undefined>(undefined);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((res) => res.json())
      .then((data: ContractConfig) => {
        if (!cancelled) {
          setAddress(data.address ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setAddress(null);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { address, isLoading: address === undefined, reload: () => setReloadKey((k) => k + 1) };
}
