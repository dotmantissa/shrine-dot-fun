export const chainConfig = {
  rpc: process.env.NEXT_PUBLIC_RITUAL_RPC || "https://rpc.ritualfoundation.org",
  shrineFactory: process.env.NEXT_PUBLIC_SHRINE_FACTORY || "0xff3ACF2377C831886bF674543eb4bE38DF19a5cc",
  aiVibe: process.env.NEXT_PUBLIC_AI_VIBE || "0xAd5b998B705027d668Ba17B63d45ee21741641eE",
  narrator: process.env.NEXT_PUBLIC_NARRATOR || "0x32c991937b4f9dD8DC128E6F4aFb18432B157ADC",
};

export function hasRuntimeContracts() {
  return Boolean(chainConfig.shrineFactory && chainConfig.aiVibe && chainConfig.narrator);
}
