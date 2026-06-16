# Snap Arc

A micro-marketplace for photo licenses on the **Arc Testnet**.

Photographers upload photos, set a license price between **0.10 and 0.50 USDC**, and receive payments directly. Buyers pay in native USDC and immediately receive an ERC-721 license NFT with on-chain metadata as proof of rights.

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, **Solidity**, **Hardhat**, **Viem**, and **Wagmi**.

---

## Features

- **Smart contract** `SnapArcMarket` handles listing, purchasing, payments, and NFT metadata.
- **Direct payments** to photographers — no platform fees or intermediaries.
- **License NFT** minted on every purchase with embedded JSON metadata.
- **Wallet connection** via Wagmi (MetaMask / injected wallets on Arc Testnet).
- **IPFS upload** integration with Pinata.
- **Agent-buyer** script that simulates real license purchases.
- **Agent-royalty** script that calculates photographer earnings from on-chain events.

---

## Quick start

```bash
npm install
npm run compile
npm run test
npm run build
npm run dev
```

The app runs at `http://localhost:3000`.

---

## Configuration

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `ARC_TESTNET_RPC` | Arc Testnet RPC endpoint (default provided). |
| `PRIVATE_KEY` | Your wallet key for Hardhat CLI deployments. |
| `AGENT_PRIVATE_KEY` | Wallet key for the buyer simulation agent. |
| `AGENT_PHOTOGRAPHER_ADDRESS` | Photographer address for the royalty agent. |
| `FROM_BLOCK` | Starting block for royalty agent event filtering. |
| `NEXT_PUBLIC_PINATA_JWT` | Pinata JWT for IPFS uploads. |

---

## Deploy the contract

### Option A — Web UI (recommended for one-time deploy)

1. Start the app: `npm run dev`
2. Open `http://localhost:3000/deploy`
3. Connect your wallet on Arc Testnet.
4. Click **Deploy SnapArcMarket**.
5. The contract address is saved to `data/contract.json` automatically.

### Option B — Hardhat CLI

```bash
npm run deploy
```

This uses `PRIVATE_KEY` from `.env` and deploys to `arcTestnet`.

---

## Use the marketplace

1. **Upload** — Go to `/upload`, add a photo (via Pinata or a direct URL), set a price, and list it.
2. **Browse** — Go to `/browse`, view active photos, and click **Buy License**.
3. **My Licenses** — Go to `/licenses` to see all your license NFTs.
4. **Earnings** — Go to `/earnings` to see total USDC earned.

---

## Agents

### Buyer agent

Simulates a real purchase by a wallet. Requires a funded agent wallet.

```bash
npm run agent:buyer
```

### Royalty agent

Calculates a photographer's earnings by reading `LicensePurchased` events.

```bash
npm run agent:royalty
```

---

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Production build. |
| `npm run lint` | ESLint. |
| `npm run type-check` | TypeScript check. |
| `npm run compile` | Compile Solidity contracts. |
| `npm run test` | Run contract + frontend tests. |
| `npm run deploy` | Deploy via Hardhat CLI. |
| `npm run agent:buyer` | Run the buyer agent. |
| `npm run agent:royalty` | Run the royalty agent. |

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Network details

- **Network:** Arc Testnet
- **Chain ID:** `5042002`
- **Currency:** USDC (18 decimals)
- **RPC:** https://rpc.testnet.arc.network
- **Explorer:** https://testnet.arcscan.app
