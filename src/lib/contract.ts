import { arcTestnet } from "./chain";
import { type Abi } from "viem";
import contractArtifact from "../../artifacts/contracts/SnapArcMarket.sol/SnapArcMarket.json";

export const MARKET_ABI = contractArtifact.abi as Abi;
export const MARKET_BYTECODE = contractArtifact.bytecode as `0x${string}`;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MARKET_CONTRACT_ADDRESS as `0x${string}` | undefined;

export const ARCSCAN_URL = arcTestnet.blockExplorers?.default.url ?? "https://testnet.arcscan.app";
