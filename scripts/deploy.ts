import { ethers } from "hardhat";

const WALLET = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948";

async function depositFor(
  signer: any,
  target: string,
  amount: string,
  lock: number
) {
  const abi = ["function depositFor(address user, uint256 lockDuration) external payable"];
  const wallet = new ethers.Contract(WALLET, abi, signer);
  const tx = await wallet.depositFor(target, lock, { value: ethers.parseEther(amount) });
  await tx.wait();
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const treasury = deployer.address;

  const ContentGuard = await ethers.getContractFactory("ContentGuard");
  const guard = await ContentGuard.deploy();
  await guard.waitForDeployment();

  const AIVibe = await ethers.getContractFactory("AIVibe");
  const aivibe = await AIVibe.deploy(WALLET);
  await aivibe.waitForDeployment();
  await depositFor(deployer, await aivibe.getAddress(), "0.2", 500);

  const SocialPulse = await ethers.getContractFactory("SocialPulse");
  const socialPulse = await SocialPulse.deploy(WALLET);
  await socialPulse.waitForDeployment();
  await depositFor(deployer, await socialPulse.getAddress(), "0.1", 500);

  const DEXRouter = await ethers.getContractFactory("DEXRouter");
  const dexRouter = await DEXRouter.deploy(treasury);
  await dexRouter.waitForDeployment();

  const ShrinePass = await ethers.getContractFactory("ShrinePass");
  const pass = await ShrinePass.deploy(await dexRouter.getAddress());
  await pass.waitForDeployment();
  await (await dexRouter.setShrinePass(await pass.getAddress())).wait();

  const ShrineFactory = await ethers.getContractFactory("ShrineFactory");
  const factory = await ShrineFactory.deploy(await guard.getAddress(), await aivibe.getAddress(), await dexRouter.getAddress(), treasury);
  await factory.waitForDeployment();
  await (await factory.initAIVibeFactoryLink()).wait();

  const ShrineNarrator = await ethers.getContractFactory("ShrineNarrator");
  const narrator = await ShrineNarrator.deploy("0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B", "0x5A16214fF555848411544b005f7Ac063742f39F6");
  await narrator.waitForDeployment();
  await depositFor(deployer, await narrator.getAddress(), "0.5", 1000);
  await (await narrator.approveScheduler("0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B")).wait();
  await (await narrator.start()).wait();

  console.log({
    contentGuard: await guard.getAddress(),
    aivibe: await aivibe.getAddress(),
    socialPulse: await socialPulse.getAddress(),
    dexRouter: await dexRouter.getAddress(),
    shrinePass: await pass.getAddress(),
    shrineFactory: await factory.getAddress(),
    shrineNarrator: await narrator.getAddress(),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
