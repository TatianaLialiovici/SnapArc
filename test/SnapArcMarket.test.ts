import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const MIN_PRICE = parseEther("0.10");
const MAX_PRICE = parseEther("0.50");

async function deployFixture() {
  const [owner, photographer, buyer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  const contract = await hre.viem.deployContract("SnapArcMarket", [
    "Snap Arc License",
    "SNAPARC",
    owner.account.address,
  ]);

  return { contract, owner, photographer, buyer, publicClient };
}

describe("SnapArcMarket", () => {
  it("Should deploy with correct parameters", async () => {
    const { contract } = await loadFixture(deployFixture);
    expect(await contract.read.name()).to.equal("Snap Arc License");
    expect(await contract.read.symbol()).to.equal("SNAPARC");
    expect(await contract.read.MIN_PRICE()).to.equal(MIN_PRICE);
    expect(await contract.read.MAX_PRICE()).to.equal(MAX_PRICE);
  });

  it("Should allow a photographer to add a photo", async () => {
    const { contract, photographer } = await loadFixture(deployFixture);

    const tx = await contract.write.addPhoto(
      ["Sunset", "A beautiful sunset", "ipfs://QmPhoto", MIN_PRICE],
      { account: photographer.account }
    );

    const receipt = await (await hre.viem.getPublicClient()).waitForTransactionReceipt({ hash: tx });
    expect(receipt.status).to.equal("success");

    const photo = await contract.read.photos([1n]);
    expect(getAddress(photo[0] as string)).to.equal(getAddress(photographer.account.address));
    expect(photo[1]).to.equal("Sunset");
    expect(photo[4]).to.equal(MIN_PRICE);
    expect(photo[5]).to.equal(true);
  });

  it("Should reject photos outside the allowed price range", async () => {
    const { contract, photographer } = await loadFixture(deployFixture);
    let threw = false;
    try {
      await contract.write.addPhoto(
        ["Cheap", "Too cheap", "ipfs://x", parseEther("0.05")],
        { account: photographer.account }
      );
    } catch {
      threw = true;
    }
    expect(threw).to.equal(true);

    threw = false;
    try {
      await contract.write.addPhoto(
        ["Expensive", "Too expensive", "ipfs://x", parseEther("0.60")],
        { account: photographer.account }
      );
    } catch {
      threw = true;
    }
    expect(threw).to.equal(true);
  });

  it("Should mint a license NFT and transfer payment to photographer", async () => {
    const { contract, photographer, buyer, publicClient } = await loadFixture(deployFixture);

    await contract.write.addPhoto(
      ["Portrait", "Studio portrait", "ipfs://QmPortrait", parseEther("0.25")],
      { account: photographer.account }
    );

    const photographerBalanceBefore = await publicClient.getBalance({
      address: photographer.account.address,
    });

    const buyHash = await contract.write.buyLicense([1n], {
      account: buyer.account,
      value: parseEther("0.25"),
    });
    const buyReceipt = await publicClient.waitForTransactionReceipt({ hash: buyHash });
    expect(buyReceipt.status).to.equal("success");

    const ownerOf = await contract.read.ownerOf([1n]);
    expect(getAddress(ownerOf)).to.equal(getAddress(buyer.account.address));

    const photographerBalanceAfter = await publicClient.getBalance({
      address: photographer.account.address,
    });
    expect(photographerBalanceAfter).to.equal(photographerBalanceBefore + parseEther("0.25"));

    const earnings = await contract.read.photographerEarnings([photographer.account.address]);
    expect(earnings).to.equal(parseEther("0.25"));
  });

  it("Should return token URI with embedded metadata", async () => {
    const { contract, photographer, buyer } = await loadFixture(deployFixture);
    await contract.write.addPhoto(
      ["Sky", "Night sky", "ipfs://QmSky", parseEther("0.30")],
      { account: photographer.account }
    );
    await contract.write.buyLicense([1n], {
      account: buyer.account,
      value: parseEther("0.30"),
    });

    const tokenURI = await contract.read.tokenURI([1n]);
    expect(tokenURI).to.include("data:application/json;base64,");
  });

  it("Should allow listing active photos and owner licenses", async () => {
    const { contract, photographer, buyer } = await loadFixture(deployFixture);
    await contract.write.addPhoto(
      ["Lake", "Calm lake", "ipfs://QmLake", parseEther("0.20")],
      { account: photographer.account }
    );
    await contract.write.addPhoto(
      ["City", "Night city", "ipfs://QmCity", parseEther("0.40")],
      { account: photographer.account }
    );
    await contract.write.buyLicense([1n], {
      account: buyer.account,
      value: parseEther("0.20"),
    });

    const activeIds = await contract.read.getActivePhotoIds();
    expect(activeIds).to.have.length(2);

    const ownerLicenses = await contract.read.getLicenseIdsByOwner([buyer.account.address]);
    expect(ownerLicenses).to.have.length(1);
  });
});
