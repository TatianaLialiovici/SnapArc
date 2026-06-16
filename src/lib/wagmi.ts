import { createConfig, http } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { arcTestnet } from "./chain";

export const config = createConfig({
  chains: [arcTestnet],
  connectors: [injected(), metaMask()],
  transports: {
    [arcTestnet.id]: http(process.env.NEXT_PUBLIC_ARC_TESTNET_RPC),
  },
  ssr: true,
});
