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
          {token.symbol === "SOL" ? (
            <svg viewBox="0 0 397.7 311.7" className="h-6 w-6">
              <linearGradient
                id="sol-gradient"
                x1="360.879"
                y1="351.455"
                x2="141.213"
                y2="-69.294"
                gradientTransform="matrix(1 0 0 -1 0 314)"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#00FFA3" />
                <stop offset="1" stopColor="#DC1FFF" />
              </linearGradient>
              <path
                fill="url(#sol-gradient)"
                d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"
              />
              <path
                fill="url(#sol-gradient)"
                d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"
              />
              <path
                fill="url(#sol-gradient)"
                d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 32 32" className="h-6 w-6">
              <circle cx="16" cy="16" r="16" fill="#2775CA" />
              <path
                fill="#fff"
                d="M20.5,18.5c0-2.1-1.3-2.8-3.8-3.1-1.8-0.3-2.2-0.7-2.2-1.4c0-0.8,0.5-1.2,1.6-1.2c1,0,1.5,0.3,1.7,1.2c0,0.1,0.1,0.2,0.3,0.2h1c0.2,0,0.3-0.1,0.3-0.3c-0.2-1.3-1.1-2.3-2.6-2.5V9.7c0-0.2-0.1-0.3-0.3-0.3h-0.9c-0.2,0-0.3,0.1-0.3,0.3v1.5c-1.7,0.2-2.8,1.3-2.8,2.8c0,2,1.2,2.7,3.7,3c1.9,0.3,2.3,0.6,2.3,1.5c0,0.9-0.7,1.4-1.9,1.4c-1.5,0-2-0.6-2.2-1.4c0-0.1-0.1-0.2-0.3-0.2h-1c-0.2,0-0.3,0.1-0.3,0.3c0.2,1.5,1.1,2.5,2.9,2.8v1.6c0,0.2,0.1,0.3,0.3,0.3h0.9c0.2,0,0.3-0.1,0.3-0.3v-1.6C19.4,21,20.5,19.9,20.5,18.5z"
              />
            </svg>
          )}
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
