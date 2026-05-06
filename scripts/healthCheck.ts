import { ethers } from "hardhat";

const WALLET = "0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948";

async function main() {
  const rpc = process.env.NEXT_PUBLIC_RITUAL_RPC || "https://rpc.ritualfoundation.org";
  const provider = new ethers.JsonRpcProvider(rpc);
  const block = await provider.getBlockNumber();

  const factory = process.env.NEXT_PUBLIC_SHRINE_FACTORY!;
  const aiVibe = process.env.NEXT_PUBLIC_AI_VIBE!;
  const narrator = process.env.NEXT_PUBLIC_NARRATOR!;

  const codes = await Promise.all([
    provider.getCode(factory),
    provider.getCode(aiVibe),
    provider.getCode(narrator),
  ]);

  const wallet = new ethers.Contract(WALLET, ["function balanceOf(address) view returns(uint256)"], provider);
  const [vibeBal, narBal] = await Promise.all([
    wallet.balanceOf(aiVibe),
    wallet.balanceOf(narrator),
  ]);

  const narratorC = new ethers.Contract(narrator, [
    "function isRunning() view returns(bool)",
    "function wakeInterval() view returns(uint32)",
    "function narrateId() view returns(uint256)",
  ], provider);

  const [running, wakeInterval, narrateId] = await Promise.all([
    narratorC.isRunning(),
    narratorC.wakeInterval(),
    narratorC.narrateId(),
  ]);

  console.log({
    rpcAlive: block > 0,
    latestBlock: block,
    contractsDeployed: codes.every((c) => c && c !== "0x"),
    ritualWalletFunded: {
      aiVibe: vibeBal.toString(),
      narrator: narBal.toString(),
    },
    narrator: {
      isRunning: running,
      wakeInterval: Number(wakeInterval),
      narrateId: narrateId.toString(),
      // proxy for liveness in this scaffold; replace with event-indexed last narration block in backend
      healthy: running && narrateId > 0n,
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
