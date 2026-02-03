import { SOL_TOKEN, USDC_TOKEN } from "./constants";
import type { Transaction } from "./types";
import bs58 from "bs58";

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

export async function getSolBalance(address: string): Promise<number> {
  try {
    const result = await rpcCall<{ value: number }>("getBalance", [address]);
    return result.value / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error("Failed to get SOL balance:", error);
    return 0;
  }
}

export async function getTokenBalance(
  address: string,
  mintAddress: string,
): Promise<number> {
  try {
    const result = await rpcCall<{
      value: Array<{
        account: {
          data: {
            parsed: {
              info: {
                tokenAmount: {
                  uiAmount: number;
                };
              };
            };
          };
        };
      }>;
    }>("getTokenAccountsByOwner", [
      address,
      { mint: mintAddress },
      { encoding: "jsonParsed" },
    ]);

    if (result.value && result.value.length > 0) {
      return result.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
    }
    return 0;
  } catch (error) {
    console.error("Failed to get token balance:", error);
    return 0;
  }
}

export async function getAllBalances(
  address: string,
): Promise<{ sol: number; usdc: number }> {
  const [sol, usdc] = await Promise.all([
    getSolBalance(address),
    getTokenBalance(address, USDC_TOKEN.mint),
  ]);
  return { sol, usdc };
}

export async function getTransactions(
  address: string,
  limit = 10,
): Promise<Transaction[]> {
  try {
    const signatures = await rpcCall<
      Array<{
        signature: string;
        blockTime: number | null;
        err: unknown;
      }>
    >("getSignaturesForAddress", [address, { limit }]);

    if (!signatures || signatures.length === 0) {
      return [];
    }

    const transactions: Transaction[] = [];

    for (const sig of signatures.slice(0, limit)) {
      try {
        const tx = await rpcCall<{
          blockTime: number | null;
          meta: {
            preBalances: number[];
            postBalances: number[];
            err: unknown;
          } | null;
          transaction: {
            message: {
              accountKeys: string[];
            };
          };
        } | null>("getTransaction", [
          sig.signature,
          { encoding: "json", maxSupportedTransactionVersion: 0 },
        ]);

        if (tx && tx.meta) {
          const accountKeys = tx.transaction.message.accountKeys;
          const preBalances = tx.meta.preBalances;
          const postBalances = tx.meta.postBalances;

          const addressIndex = accountKeys.findIndex(
            (key: string) => key === address,
          );

          if (addressIndex !== -1) {
            const balanceChange =
              (postBalances[addressIndex] - preBalances[addressIndex]) / 1e9;
            const isReceive = balanceChange > 0;

            transactions.push({
              signature: sig.signature,
              timestamp:
                (tx.blockTime || sig.blockTime || Date.now() / 1000) * 1000,
              type: isReceive ? "receive" : "send",
              amount: Math.abs(balanceChange),
              token: SOL_TOKEN,
              from: isReceive
                ? accountKeys[0] !== address
                  ? accountKeys[0]
                  : accountKeys[1] || address
                : address,
              to: isReceive ? address : accountKeys[1] || accountKeys[0],
              status: sig.err ? "failed" : "confirmed",
              fee:
                tx.meta.preBalances[0] - tx.meta.postBalances[0] > 0
                  ? 0.000005
                  : undefined,
              blockTime: tx.blockTime || undefined,
            });
          }
        }
      } catch (txError) {
        console.error("Failed to fetch transaction:", sig.signature, txError);
      }
    }

    return transactions;
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return [];
  }
}

export function isValidSolanaAddress(address: string): boolean {
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

export async function sendSignedTransaction(signedTx: Transaction) {
  const serializedTx = signedTx.serialize();
  const txBase58 = bs58.encode(serializedTx);

  // Send via RPC
  const result = await rpcCall<{ signature: string }>("sendTransaction", [
    txBase58,
  ]);
  return result.signature;
}

export async function fetchRecentBlockhash() {
  const primaryUrl = getRpcUrl();
  const response = await fetch(`${primaryUrl}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getLatestBlockhash",
      params: [],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "RPC error");
  }

  return data.result.value.blockhash;
}
