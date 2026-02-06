import { SUPPORTED_TOKENS } from "@/lib/blockchain/constants";
import {
  getEthBalance,
  getTokenBalance,
} from "@/lib/blockchain/ethereum-client";
import { TokenBalance } from "@/lib/blockchain/types";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface useBalancesProperties {
  address: string;
}

interface useBalancesReturn {
  balances: TokenBalance[];
  totalBalance: number;
  refetchBalances: () => void;
}

export const useBalances = ({
  address,
}: useBalancesProperties): useBalancesReturn => {
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  // Effect to fetch token prices
  useEffect(() => {
    const fetchPrices = async () => {
      const symbols = SUPPORTED_TOKENS.map((token) => token.symbol).join(",");
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?symbols=${symbols}&vs_currencies=usd`,
      );
      const data = await response.json();
      const prices: Record<string, number> = {};
      SUPPORTED_TOKENS.forEach((token) => {
        const symbol = token.symbol.toLowerCase();
        prices[symbol] = data[symbol]?.usd || 0;
      });
      setTokenPrices(prices);
    };

    fetchPrices();
  }, []);

  // Query for fetching balances every 10 seconds
  const {
    data: balancesData,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["balances", address, tokenPrices],
    queryFn: async () => {
      if (!address || Object.keys(tokenPrices).length === 0) {
        return { balances: [], totalBalance: 0 };
      }

      const balances: TokenBalance[] = [];
      let total = 0;

      for (const token of SUPPORTED_TOKENS) {
        let balance: number;

        if (token.symbol === "ETH") {
          balance = await getEthBalance(address);
        } else {
          balance = await getTokenBalance(address, token.address);
        }

        const price = tokenPrices[token.symbol.toLowerCase()] || 0;
        const usdValue = balance * price;

        balances.push({
          token,
          balance,
          usdValue,
        });

        total += usdValue;
      }

      return { balances, totalBalance: total };
    },
    refetchInterval: 10000,
    enabled: !!address && Object.keys(tokenPrices).length > 0,
  });

  if (isError) {
    console.error("Error fetching balances:", isError);
    return { balances: [], totalBalance: 0, refetchBalances: refetch };
  }

  if (isLoading) {
    return { balances: [], totalBalance: 0, refetchBalances: refetch };
  }

  return {
    balances: balancesData?.balances || [],
    totalBalance: balancesData?.totalBalance || 0,
    refetchBalances: refetch,
  };
};
