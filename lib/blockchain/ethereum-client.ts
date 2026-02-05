import { ETH_TOKEN, USDC_TOKEN } from "./constants";
import type { Transaction } from "./types";
import { ethers } from "ethers";

const FALLBACK_RPC_URLS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://eth-sepolia.api.onfinality.io/public",
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
    getTokenBalance(address, USDC_TOKEN.address),
  ]);
  return { eth, usdc };
}

async function getOneYearBlockHexes(): Promise<[string, string]> {
  // Estimate the number of blocks in a year (365 days)
  const secondsInYear = 30 * 24 * 60 * 60;
  const averageBlockTime = 15; // seconds
  const blocksInYear = Math.floor(secondsInYear / averageBlockTime);

  // Get the current block number
  const currentBlock = parseInt(
    await rpcCall<string>("eth_blockNumber", []),
    16,
  );

  // Determine the block number one year ago
  const yearAgoBlock = currentBlock - blocksInYear;
  const yearAgoBlockHex = `0x${yearAgoBlock.toString(16)}`;
  const currentBlockHex = `0x${currentBlock.toString(16)}`;
  return [yearAgoBlockHex, currentBlockHex];
}

export async function getTransactions(
  address: string,
  limit = 10,
): Promise<Transaction[]> {
  const transactions: Transaction[] = [];

  const [yearAgoBlockHex, currentBlockHex] = await getOneYearBlockHexes();

  try {
    const logs = await rpcCall<
      Array<{
        address: string;
        blockNumber: string;
        transactionHash: string;
        data: string;
        topics: string[];
      }>
    >("eth_getLogs", [
      {
        address: address,
        fromBlock: yearAgoBlockHex, // Block number one year ago
        toBlock: currentBlockHex,
      },
    ]);

    if (logs && logs.length > 0) {
      logs.forEach((log) => {
        if (
          log.transactionHash &&
          log.address.toLowerCase() === address.toLowerCase()
        ) {
          transactions.push({
            signature: log.transactionHash,
            timestamp: parseInt(log.blockNumber, 16) * 1000, // Requires fetching the timestamp from the block
            type: log.topics[0] === address.toLowerCase() ? "receive" : "send",
            amount: parseInt(log.data, 16) / 1e18,
            token: ETH_TOKEN,
            from: log.address,
            to: address,
            status: "confirmed",
            fee: 0, // Calculate fee if required
          });
        }
      });
    }

    // Return the latest transactions in chronological order, limited by the specified amount
    return transactions.slice(-limit).reverse();
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
