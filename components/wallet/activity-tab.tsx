"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/wallet-context";
import { truncateAddress, formatBalance } from "@/lib/blockchain/utils";

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 1000 * 60) return "Just now";
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
  if (diff < 1000 * 60 * 60 * 24)
    return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
  if (diff < 1000 * 60 * 60 * 24 * 7)
    return `${Math.floor(diff / (1000 * 60 * 60 * 24))}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

export function ActivityTab() {
  const { activeAccount, isPrivateMode, transactions, refreshTransactions } =
    useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    await refreshTransactions();
    setIsLoading(false);
  }, [refreshTransactions]);

  useEffect(() => {
    if (!isPrivateMode) {
      fetchTransactions();
    }
  }, [activeAccount, isPrivateMode, fetchTransactions]);

  if (isPrivateMode) {
    return (
      <div className="flex flex-col items-center justify-center h-64 px-8 text-center">
        <p className="text-sm text-muted-foreground">
          Transaction history is hidden in private mode.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Loading transactions...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Recent Activity
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={fetchTransactions}
          aria-label="Refresh transactions"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <p className="text-sm text-muted-foreground">No transactions yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Transaction history will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => (
            <div
              key={tx.signature}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  tx.type === "receive"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                }`}
              >
                {tx.type === "receive" ? (
                  <ArrowDownLeft className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{tx.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {tx.type === "receive" ? "From" : "To"}:{" "}
                  {truncateAddress(tx.type === "receive" ? tx.from : tx.to)}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`font-medium ${
                    tx.type === "receive"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {tx.type === "receive" ? "+" : "-"}
                  {formatBalance(tx.amount)} {tx.token.symbol}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
