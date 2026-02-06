"use client";

import { Loader2 } from "lucide-react";
import { TokenBalanceCard } from "./token-balance-card";
import { useWallet } from "@/contexts/wallet-context";
import { useBalances } from "@/hooks/use-balances";

export function BalanceList() {
  const { activeAccount, isLoading } = useWallet();
  const { balances } = useBalances({
    address: activeAccount?.address || "",
  });

  return (
    <div className="flex flex-col gap-3 px-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Balance
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {balances.map((tokenBalance) => (
            <TokenBalanceCard
              key={tokenBalance.token.symbol}
              tokenBalance={tokenBalance}
            />
          ))}
        </div>
      )}
    </div>
  );
}
