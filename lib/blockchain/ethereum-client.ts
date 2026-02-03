import { ETH_TOKEN, USDC_TOKEN } from "./constants";
import type { Transaction } from "./types";
import { ethers } from "ethers";

const FALLBACK_RPC_URLS = [
  "wss://ethereum-rpc.publicnode.com", // Ethereum public mainnet rpc
].filter(Boolean); // Remove empty strings

function getRpcUrl(): string {
  return process.env.RPC_URL || "";
}

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const primaryUrl = getRpcUrl();
  const urlsToTry = primaryUrl
    ? [primaryUrl, ...FALLBACK_RPC_URLS]
    : FALLBACK_RPC_URLS;

  let lastError: Error | null = null;

  for (let i = 0; i < urlsToTry.length; i++) {
    const url = urlsToTry[i];
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method,
          params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "RPC error");
      }

      return data.result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`RPC call to ${url} failed:`, error);
    }
  }

  throw lastError || new Error("All RPC endpoints failed");
}

export async function getEthBalance(address: string): Promise<number> {
  try {
    const result = await rpcCall<string>("eth_getBalance", [address, "latest"]);
    return parseInt(result, 16) / 1e18;
  } catch (error) {
    console.error("Failed to get ETH balance:", error);
    return 0;
  }
}

export async function getTokenBalance(
  address: string,
  tokenAddress: string,
): Promise<number> {
  try {
    // Use standard ERC20 ABI for balanceOf
    const abi = ["function balanceOf(address) view returns (uint256)"];
    const iface = new ethers.Interface(abi);
    const data = iface.encodeFunctionData("balanceOf", [address]);

    const result = await rpcCall<string>("eth_call", [
      {
        to: tokenAddress,
        data: data,
      },
      "latest",
    ]);

    return parseInt(result, 16) / 1e6;
  } catch (error) {
    console.error("Failed to get token balance:", error);
    return 0;
  }
}

export async function getAllBalances(
  address: string,
): Promise<{ eth: number; usdc: number }> {
  const [eth, usdc] = await Promise.all([
    getEthBalance(address),
    getTokenBalance(address, USDC_TOKEN.mint),
  ]);
  return { eth, usdc };
}

export async function getTransactions(
  address: string,
  limit = 10,
): Promise<Transaction[]> {
  try {
    const txs = await rpcCall<
      Array<{
        hash: string;
        blockNumber: string;
        from: string;
        to: string;
        value: string;
        gas: string;
        gasPrice: string;
        input: string;
        timestamp: number;
      }>
    >("eth_getTransactionByAddress", [address, limit]);

    if (!txs || txs.length === 0) {
      return [];
    }

    return txs.map((tx) => ({
      signature: tx.hash,
      timestamp: tx.timestamp * 1000,
      type:
        tx.from.toLowerCase() === address.toLowerCase() ? "send" : "receive",
      amount: parseInt(tx.value, 16) / 1e18,
      token: ETH_TOKEN,
      from: tx.from,
      to: tx.to,
      status: "confirmed",
      fee: (parseInt(tx.gas, 16) * parseInt(tx.gasPrice, 16)) / 1e18,
    }));
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return [];
  }
}

export function isValidEvmAddress(address: string): boolean {
  return ethers.isAddress(address);
}

export async function sendSignedTransaction(signedTx: string) {
  return await rpcCall<string>("eth_sendRawTransaction", [signedTx]);
}

export async function fetchRecentBlockhash() {
  const blockNumber = await rpcCall<string>("eth_blockNumber", []);
  return blockNumber;
}
