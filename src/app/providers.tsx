"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { reconnect } from "@wagmi/core";
import { config } from "@/lib/wagmi";
import { useEffect, useState } from "react";

function AutoReconnect() {
  useEffect(() => {
    reconnect(config);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AutoReconnect />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
