import { injected } from "wagmi/connectors";
import type { CreateConnectorFn } from "wagmi";

export function rabby(): CreateConnectorFn {
  return injected({
    target: {
      id: "rabby",
      name: "Rabby",
      provider: () => {
        if (typeof window === "undefined") return undefined;
        const ethereum = (window as unknown as { ethereum?: unknown }).ethereum;
        const rabby = (window as unknown as { rabby?: unknown }).rabby;
        return (rabby as any) ?? (ethereum as any) ?? undefined;
      },
    },
  });
}

export function hasRabby(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as { rabby?: unknown }).rabby;
}
