import { createPublicClient, http, parseAbi, formatEther } from "viem";
import { readFile } from "fs/promises";
import { arcTestnet } from "../src/lib/chain";

const photographer = process.env.AGENT_PHOTOGRAPHER_ADDRESS;
if (!photographer) {
  throw new Error("AGENT_PHOTOGRAPHER_ADDRESS is required");
}
const photographerAddress = photographer as string;

const rpc = process.env.ARC_TESTNET_RPC || arcTestnet.rpcUrls.default.http[0];
const fromBlock = process.env.FROM_BLOCK ? BigInt(process.env.FROM_BLOCK) : 0n;

const abi = parseAbi([
  "event LicensePurchased(uint256 indexed tokenId, uint256 indexed photoId, address indexed buyer, address photographer, uint256 pricePaid, uint256 timestamp)",
]);

async function main() {
  const config = JSON.parse(await readFile("data/contract.json", "utf-8")) as { address: string | null };
  if (!config.address || !config.address.startsWith("0x")) {
    throw new Error("Contract address not set. Deploy the contract first.");
  }

  const publicClient = createPublicClient({ chain: arcTestnet, transport: http(rpc) });

  const logs = await publicClient.getLogs({
    address: config.address as `0x${string}`,
    event: abi[0],
    fromBlock,
    toBlock: "latest",
  });

  const filtered = logs.filter(
    (log) => (log.args.photographer as string).toLowerCase() === photographerAddress.toLowerCase()
  );

  const total = filtered.reduce((sum, log) => sum + (log.args.pricePaid ?? 0n), 0n);

  console.log(`
Royalty report for ${photographerAddress}
Period: block ${fromBlock.toString()} to latest
Licenses sold: ${filtered.length}
Total earnings: ${formatEther(total)} USDC
Transactions:
${filtered
  .map(
    (log) =>
      `  Photo #${log.args.photoId} buyer ${log.args.buyer} price ${formatEther(
        log.args.pricePaid ?? 0n
      )} USDC at block ${log.blockNumber}`
  )
  .join("\n")}
`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
