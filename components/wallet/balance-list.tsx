"use client";

import { Button } from "@/components/ui/button";
import { ArrowDownToLine, CreditCard, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import { useBalances } from "@/hooks/use-balances";
import { TokenBalanceCard } from "./token-balance-card";

export function BalanceList() {
  const { activeAccount, isLoading } = useWallet();
  const { balances } = useBalances({
    address: activeAccount?.address || "",
  });

  const hasBalances = balances && balances.length > 0;

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
          {hasBalances ? (
            <div className="grid grid-cols-2 gap-3">
              {balances.map((tokenBalance) => (
                <TokenBalanceCard
                  key={tokenBalance.token.symbol}
                  tokenBalance={tokenBalance}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <p className="text-center text-muted-foreground">
                No tokens found in this wallet
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors bg-transparent"
                  onClick={() => {
                    //TODO: Implement
                  }}
                  aria-label="Deposit"
                >
                  <ArrowDownToLine className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors bg-transparent"
                  onClick={() => {
                    // TODO: Implement
                  }}
                  aria-label="Deposit"
                >
                  <CreditCard className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
