import type { Token } from "./types";

export const ETH_TOKEN: Token = {
  symbol: "ETH",
  name: "Ethereum",
  address: "0x0000000000000000000000000000000",
  decimals: 18,
  logoUrl: "assets/tokens/eth.svg",
};

export const USDC_TOKEN: Token = {
  symbol: "USDC",
  name: "USD Coin",
  address: "0x3600000000000000000000000000000000000000",
  decimals: 6,
  logoUrl: "assets/tokens/usdc.svg",
};

export const SUPPORTED_TOKENS = [ETH_TOKEN, USDC_TOKEN];

// Price API endpoints
export const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Account avatar colors
export const AVATAR_COLORS = [
  "#1144ec",
  "#11b2ed",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
];

// Onboarding storage key
export const ONBOARDING_COMPLETE_KEY = "ruma_wallet_onboarding_complete";
export const WALLET_STATE_KEY = "ruma_wallet_state";
