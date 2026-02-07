"use client";

import type { TokenBalance } from "@/lib/blockchain/types";
import { formatBalance, formatUsdValue } from "@/lib/blockchain/utils";

interface TokenBalanceCardProps {
  tokenBalance: TokenBalance;
}

export function TokenBalanceCard({ tokenBalance }: TokenBalanceCardProps) {
  const { token, balance, usdValue } = tokenBalance;

  const displayBalance = formatBalance(balance);
  const displayUsdValue = formatUsdValue(usdValue);

  return (
    <div
      key={tokenBalance.token.symbol}
      className="flex flex-col gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors skeuomorphic-card"
    >
      <div className="flex items-left gap-3">
        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center overflow-hidden">
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
