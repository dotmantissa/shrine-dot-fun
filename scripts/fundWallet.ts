import { ethers } from "hardhat";

const WALLET = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948";

async function main() {
  const [deployer] = await ethers.getSigners();
  const target = process.argv[2];
  const amount = process.argv[3] ?? "0.1";
  const lock = process.argv[4] ?? "500";

  const abi = ["function depositFor(address user, uint256 lockDuration) external payable"];
  const wallet = new ethers.Contract(WALLET, abi, deployer);
  const tx = await wallet.depositFor(target, lock, { value: ethers.parseEther(amount) });
  await tx.wait();
  console.log(`funded ${target} ${amount} RITUAL lock=${lock}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
