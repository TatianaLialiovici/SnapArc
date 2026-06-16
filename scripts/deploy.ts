import hre from "hardhat";
import { writeFile } from "fs/promises";
import { getAddress } from "viem";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  if (!deployer) {
    throw new Error("No deployer account found. Set PRIVATE_KEY in .env or add a funded account to Hardhat.");
  }

  const contract = await hre.viem.deployContract("SnapArcMarket", [
    "Snap Arc License",
    "SNAPARC",
    deployer.account.address,
  ]);

  const address = getAddress(contract.address);
  console.log(`SnapArcMarket deployed to ${address} on ${hre.network.name}`);

  if (process.env.SAVE_CONTRACT_ADDRESS) {
    await writeFile(
      "data/contract.json",
      JSON.stringify({ address }, null, 2),
      "utf-8"
    );
    console.log("Contract address saved to data/contract.json");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
