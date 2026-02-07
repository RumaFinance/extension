import { AVATAR_COLORS } from "./constants";

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 4)}...${address.slice(-chars)}`;
}

export function truncateAddressSimple(address: string, chars = 6): string {
  if (!address) return "";
  return `${address.slice(2, chars + 2)}`;
}

export const formatTokenValue = (
  value: number,
  options?: { isTooltip?: boolean },
): string => {
  const { isTooltip = false } = options ?? {};

  if (isTooltip) {
    // For tooltip, show full value with comma separators
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 18,
    });
  }

  if (value === 0) {
    return "0";
  }
  if (value > 0 && value < 0.001) {
    return "<0.001";
  }
  if (value >= 1_000_000_000) {
    return `${Number((value / 1_000_000_000).toFixed(2))}B`;
  }
  if (value >= 1_000_000) {
    return `${Number((value / 1_000_000).toFixed(2))}M`;
  }
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(2))}K`;
  }
  if (value >= 1) {
    // Special case for values that round to a whole number like 1.000002 -> 1.00
    const rounded = Math.round(value * 100) / 100;
    if (rounded % 1 === 0 && value % 1 !== 0) {
      return rounded.toFixed(2);
    }
    // For other numbers, convert to string to trim trailing zeros e.g. 1.50 -> 1.5
    return String(rounded);
  }
  if (value >= 0.001) {
    // Show 2 significant digits and trim trailing zeros
    return String(Number(value.toPrecision(2)));
  }

  return String(value); // Fallback for any other case
};

export function formatBalance(balance: number, decimals = 2): string {
  if (balance === 0) return "0";
  if (balance < 0.0001) return "<0.0001";
  return balance.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export const formatFiatValue = (
  value: number,
  options?: { isTooltip?: boolean },
): string => {
  const { isTooltip = false } = options ?? {};

  if (isTooltip) {
    if (value === 0) {
      return "";
    }
    return (
      "$" +
      value.toLocaleString("en-US", {
        maximumFractionDigits: 20,
      })
    );
  }

  if (value === 0) {
    return "$0.00";
  }
  if (value > 0 && value < 0.01) {
    return "<$0.01";
  }
  if (value >= 1_000_000_000) {
    const value_ = value / 1_000_000_000;
    const truncated = Math.floor(value_ * 100) / 100;
    return `$${truncated.toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return "$" + value.toFixed(2);
};

export function formatUsdValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getRandomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function generateAccountId(): string {
  return `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function microUsdcToUsdc(microUsdc: number): number {
  return microUsdc / 1e6;
}

export function usdcToMicroUsdc(usdc: number): number {
  return Math.floor(usdc * 1e6);
}
