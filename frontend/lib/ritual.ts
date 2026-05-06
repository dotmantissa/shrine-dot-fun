import { defineChain } from "viem";
import { RITUAL_EXPLORER, RITUAL_HTTP_RPC } from "./wallet";

export const ritualChain = defineChain({
  id: 1979,
  name: "Ritual Testnet",
  nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
  rpcUrls: { default: { http: [RITUAL_HTTP_RPC] } },
  blockExplorers: {
    default: { name: "Ritual Explorer", url: RITUAL_EXPLORER },
  },
});
