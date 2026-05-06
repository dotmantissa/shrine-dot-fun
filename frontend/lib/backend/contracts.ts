export const chainConfig = {
  rpc: process.env.NEXT_PUBLIC_RITUAL_RPC || "https://rpc.ritualfoundation.org",
  shrineFactory: process.env.NEXT_PUBLIC_SHRINE_FACTORY || "0xb7F9b5FdD7e206D4139851aAa3be98348CdAa571",
  aiVibe: process.env.NEXT_PUBLIC_AI_VIBE || "0x1dCa43F45D20B9C265bFEa9813154208032E5eE1",
  narrator: process.env.NEXT_PUBLIC_NARRATOR || "0x32c991937b4f9dD8DC128E6F4aFb18432B157ADC",
};

export function hasRuntimeContracts() {
  return Boolean(chainConfig.shrineFactory && chainConfig.aiVibe && chainConfig.narrator);
}
