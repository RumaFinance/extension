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
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors skeuomorphic-card">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center overflow-hidden">
          <img
            src={token.logoUrl}
            onError={(e) => {
              console.error("Image load error:", {
                src: token.logoUrl,
                event: e,
              });
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{token.symbol}</span>
          <span className="text-sm text-muted-foreground">
            {displayBalance}
          </span>
        </div>
      </div>
      <span className="font-medium">{displayUsdValue}</span>
    </div>
  );
}
