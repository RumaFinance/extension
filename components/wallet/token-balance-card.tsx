"use client";

import type { TokenBalance } from "@/lib/blockchain/types";
import { formatTokenValue, formatFiatValue } from "@/lib/blockchain/utils";

interface TokenBalanceCardProps {
  tokenBalance: TokenBalance;
}

export function TokenBalanceCard({ tokenBalance }: TokenBalanceCardProps) {
  const { token, balance, usdValue } = tokenBalance;

  const displayBalance = formatTokenValue(balance);
  const displayUsdValue = formatFiatValue(usdValue);

  return (
    <div
      key={tokenBalance.token.symbol}
      className="flex flex-col gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors skeuomorphic-card"
    >
      <div className="flex items-center justify-start gap-2">
        <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center overflow-hidden">
          <img
            src={token.logoUrl}
            alt={token.symbol}
            className="h-full w-full object-contain"
            onError={(e) => {
              console.error("Image load error:", {
                src: token.logoUrl,
                event: e,
              });
            }}
          />
        </div>
        <span className="font-medium">{token.name}</span>
      </div>
      <div className="flex justify-between items-end">
        <div className="flex gap-1">
          <span className="text-sm text-muted-foreground">
            {displayBalance}
          </span>
          <span className="text-sm text-muted-foreground">{token.symbol}</span>
        </div>
        <span className="font-medium">{displayUsdValue}</span>
      </div>
    </div>
  );
}
