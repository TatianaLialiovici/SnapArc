import { createPublicClient, createWalletClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFile } from "fs/promises";
import { arcTestnet } from "../src/lib/chain";
import { MARKET_ABI } from "../src/lib/contract";

const PHOTOGRAPHER_ADDRESS = process.env.AGENT_PHOTOGRAPHER_ADDRESS;
const privateKeyRaw = process.env.AGENT_PRIVATE_KEY as `0x${string}` | undefined;
const rpc = process.env.ARC_TESTNET_RPC || arcTestnet.rpcUrls.default.http[0];

if (!privateKeyRaw) {
  throw new Error("AGENT_PRIVATE_KEY is required");
}
const privateKey = privateKeyRaw;

async function main() {
  const config = JSON.parse(await readFile("data/contract.json", "utf-8")) as { address: string | null };
  if (!config.address || !config.address.startsWith("0x")) {
    throw new Error("Contract address not set. Deploy the contract first.");
  }

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: arcTestnet, transport: http(rpc) });
  const walletClient = createWalletClient({ account, chain: arcTestnet, transport: http(rpc) });

  const activeIds = (await publicClient.readContract({
    address: config.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "getActivePhotoIds",
  })) as bigint[];

  if (activeIds.length === 0) {
    console.log("No active photos to purchase.");
    return;
  }

  let ids: bigint[] = [];
  if (PHOTOGRAPHER_ADDRESS) {
    for (const id of activeIds) {
      const photo = (await publicClient.readContract({
        address: config.address as `0x${string}`,
        abi: MARKET_ABI,
        functionName: "photos",
        args: [id],
      })) as [string, string, string, string, bigint, boolean, bigint];
      if (photo[0].toLowerCase() === PHOTOGRAPHER_ADDRESS.toLowerCase()) {
        ids.push(id);
      }
    }
    if (ids.length === 0) {
      console.log(`No active photos by ${PHOTOGRAPHER_ADDRESS}.`);
      return;
    }
  } else {
    ids = activeIds;
  }

  const photoId = ids[Math.floor(Math.random() * ids.length)];
  const photo = (await publicClient.readContract({
    address: config.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "photos",
    args: [photoId],
  })) as [string, string, string, string, bigint, boolean, bigint];
  const price = photo[4];

  const hash = await walletClient.writeContract({
    address: config.address as `0x${string}`,
    abi: MARKET_ABI,
    functionName: "buyLicense",
    args: [photoId],
    value: price,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(
    `Purchased license for photo #${photoId} (${photo[1]}) for ${formatEther(price)} USDC. ` +
      `Tx: ${hash} (status: ${receipt.status})`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
