export const chainConfig = {
  rpc: process.env.NEXT_PUBLIC_RITUAL_RPC || "https://rpc.ritualfoundation.org",
  shrineFactory: process.env.NEXT_PUBLIC_SHRINE_FACTORY || "0x57E6B27A646d41e8cDc61202fb337414c75502aE",
  aiVibe: process.env.NEXT_PUBLIC_AI_VIBE || "0x78a67CA08dA92c95e2E4836d718902A328dD10e4",
  narrator: process.env.NEXT_PUBLIC_NARRATOR || "0x32c991937b4f9dD8DC128E6F4aFb18432B157ADC",
};

export function hasRuntimeContracts() {
  return Boolean(chainConfig.shrineFactory && chainConfig.aiVibe && chainConfig.narrator);
}
