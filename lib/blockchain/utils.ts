import { AVATAR_COLORS } from "./constants"

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ""
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatBalance(balance: number, decimals = 4): string {
  if (balance === 0) return "0"
  if (balance < 0.0001) return "<0.0001"
  return balance.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

export function formatUsdValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

export function generateAccountId(): string {
  return `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function lamportsToSol(lamports: number): number {
  return lamports / 1e9
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9)
}

export function microUsdcToUsdc(microUsdc: number): number {
  return microUsdc / 1e6
}

export function usdcToMicroUsdc(usdc: number): number {
  return Math.floor(usdc * 1e6)
}
