export const chainConfig = {
  rpc: process.env.NEXT_PUBLIC_RITUAL_RPC || "https://rpc.ritualfoundation.org",
  shrineFactory: process.env.NEXT_PUBLIC_SHRINE_FACTORY,
  aiVibe: process.env.NEXT_PUBLIC_AI_VIBE,
  narrator: process.env.NEXT_PUBLIC_NARRATOR,
};

export function hasRuntimeContracts() {
  return Boolean(chainConfig.shrineFactory && chainConfig.aiVibe && chainConfig.narrator);
}
