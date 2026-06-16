# AGENTS.md

## Project context

This repository contains **Snap Arc**, a real photo-license marketplace for Arc Testnet.

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Wagmi, Viem.
- **Contracts:** Hardhat 2 with Viem plugin, Solidity 0.8.27, OpenZeppelin 5.
- **Storage:** IPFS via Pinata (optional, can also use direct URLs).
- **Contract address:** persisted in `data/contract.json` and exposed via `/api/config`.

## Build & test

Always run these before finishing work:

```bash
npm run compile
npm run test
npm run type-check
npm run lint
npm run build
```

## Architecture

- `contracts/SnapArcMarket.sol` — ERC-721 marketplace.
- `hardhat.config.ts` — Hardhat config with `arcTestnet` network.
- `scripts/deploy.ts` — Hardhat CLI deploy script.
- `scripts/agent-buyer.ts` — Simulates real license purchases.
- `scripts/agent-royalty.ts` — Computes earnings from events.
- `src/lib/chain.ts` — Arc Testnet chain definition.
- `src/lib/contract.ts` — Contract ABI/bytecode and helper URLs.
- `src/app/*` — Next.js pages.
- `src/components/*` — Reusable UI components.
- `src/hooks/*` — Wagmi hooks and contract-address hook.
- `data/contract.json` — Runtime contract address store.
- `src/app/api/config/route.ts` — API to read/write the contract address.

## Deployment workflow

1. The contract is deployed from the user's wallet via `/deploy` or the Hardhat CLI.
2. After deployment, the address is saved to `data/contract.json`.
3. All UI pages read the address from `/api/config` at runtime.

## Important notes

- Do not use mocks, placeholders, or simulated blockchain logic.
- Only use the user's own private key for deployments.
- Keep `data/contract.json` updated with the real deployed address.
