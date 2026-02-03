"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Account,
  WalletState,
  TokenBalance,
  Transaction,
} from "@/lib/blockchain/types";
import {
  SOL_TOKEN,
  USDC_TOKEN,
  WALLET_STATE_KEY,
  ONBOARDING_COMPLETE_KEY,
} from "@/lib/blockchain/constants";
import { getRandomColor, generateAccountId } from "@/lib/blockchain/utils";
import {
  getAllBalances,
  getTransactions as fetchEthereumTransactions,
  fetchRecentBlockhash,
} from "@/lib/blockchain/ethereum-client";
import * as bip39 from "bip39";
import bs58 from "bs58";
import nacl from "tweetnacl";

interface WalletContextType {
  // State
  accounts: Account[];
  activeAccount: Account | null;
  isPrivateMode: boolean;
  balances: TokenBalance[];
  transactions: Transaction[];
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  setPrivateMode: (enabled: boolean) => void;
  setActiveAccount: (accountId: string) => void;
  createNewAccount: () => Promise<{ mnemonic: string; account: Account }>;
  importAccount: (
    method: "mnemonic" | "privateKey",
    value: string,
  ) => Promise<Account>;
  updateAccountName: (accountId: string, name: string) => void;
  refreshBalances: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  completeOnboarding: (account: Account) => void;
  signTransaction: (tx: any) => Promise<any>;
}

const STORE_NAME = "ruma-keypairs";

async function initBrowserDB() {
  return new Promise<void>((resolve) => {
    const transaction = indexedDB.open("WalletDB", 1);
    transaction.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(STORE_NAME);
    };
    transaction.onsuccess = () => resolve();
  });
}

async function getKeypairFromStorage(
  accountId: string,
): Promise<Keypair | null> {
  return new Promise((resolve) => {
    const transaction = indexedDB.open("WalletDB", 1);
    transaction.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(accountId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    };
  });
}

async function storeKeypair(
  accountId: string,
  keypair: Keypair,
): Promise<void> {
  return new Promise((resolve) => {
    const transaction = indexedDB.open("WalletDB", 1);
    transaction.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put((keypair as any)._keypair, accountId); // TODO: Check why _keypair object exists inside Keypair
      tx.oncomplete = () => resolve();
    };
  });
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

async function deriveKeypairFromMnemonic(
  mnemonic: string,
  accountIndex = 0,
): Promise<Keypair> {
  // Use bip39 to convert mnemonic to seed
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // Use first 32 bytes as seed, combined with account index for derivation
  const seedArray = new Uint8Array(seed);
  let finalSeed = seedArray.slice(0, 32);

  // If accountIndex > 0, derive a child key by hashing seed with index
  if (accountIndex > 0) {
    const indexBuffer = new Uint8Array(4);
    new DataView(indexBuffer.buffer).setUint32(0, accountIndex, true);
    const combined = new Uint8Array([...finalSeed, ...indexBuffer]);
    const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
    finalSeed = new Uint8Array(hashBuffer);
  }

  const keypair = nacl.sign.keyPair.fromSeed(finalSeed);
  return Keypair.fromSecretKey(keypair.secretKey);
}

// Create keypair from private key (base58 encoded)
function keypairFromPrivateKey(privateKey: string): Keypair {
  const decoded = bs58.decode(privateKey);
  return Keypair.fromSecretKey(decoded);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(() => {
    // Check localStorage for existing state
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(WALLET_STATE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Invalid stored state, start fresh
        }
      }
    }
    return {
      accounts: [],
      activeAccountId: "",
      isPrivateMode: false,
      isOnboarded: false,
    };
  });

  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeAccount =
    state.accounts.find((a) => a.id === state.activeAccountId) || null;

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(WALLET_STATE_KEY, JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    initBrowserDB();
  }, []);

  // Fetch real balances from mainnet and shadowwire (private mode)
  const refreshBalances = useCallback(async () => {
    if (!activeAccount) {
      setBalances([
        { token: SOL_TOKEN, balance: 0, usdValue: 0 },
        { token: USDC_TOKEN, balance: 0, usdValue: 0 },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      let sol: number = 0;
      let usdc: number = 0;

      // First fetch ShadowWire balances if in private mode
      if (state.isPrivateMode) {
        sol = 0;
        usdc = 0;
      }

      // Only fetch mainnet balances if not in private mode
      if (!state.isPrivateMode) {
        const mainnetBalances = await getAllBalances(activeAccount.address);
        sol = mainnetBalances.sol || sol; // Fallback to ShadowWire if mainnet fails
        usdc = mainnetBalances.usdc || usdc; // Fallback to ShadowWire if mainnet fails
      }

      // Fetch prices from CoinGecko
      let ethPrice = 0;
      let usdcPrice = 1;
      try {
        const priceResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd",
          { cache: "force-cache" },
        );
        const prices = await priceResponse.json();
        ethPrice = prices.ethereum?.usd || 0;
        usdcPrice = prices["usd-coin"]?.usd || 1;
      } catch {
        // Price fetch failed, use defaults
      }

      setBalances([
        { token: SOL_TOKEN, balance: sol, usdValue: sol * ethPrice },
        { token: USDC_TOKEN, balance: usdc, usdValue: usdc * usdcPrice },
      ]);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setBalances([
        { token: SOL_TOKEN, balance: 0, usdValue: 0 },
        { token: USDC_TOKEN, balance: 0, usdValue: 0 },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [activeAccount, state.isPrivateMode]);

  // Fetch real transactions from devnet
  const refreshTransactions = useCallback(async () => {
    if (!activeAccount || state.isPrivateMode) {
      setTransactions([]);
      return;
    }

    try {
      const txs = await fetchEthereumTransactions(activeAccount.address, 10);
      setTransactions(txs);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
    }
  }, [activeAccount, state.isPrivateMode]);

  // Refresh balances on mount and when active account changes
  useEffect(() => {
    if (state.isOnboarded) {
      refreshBalances();
      refreshTransactions();
    }
  }, [refreshBalances, refreshTransactions, state.isOnboarded]);

  const setPrivateMode = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, isPrivateMode: enabled }));
  }, []);

  const setActiveAccount = useCallback((accountId: string) => {
    setState((prev) => ({ ...prev, activeAccountId: accountId }));
  }, []);

  const createNewAccount = useCallback(async () => {
    // Generate real BIP39 mnemonic
    const mnemonic = bip39.generateMnemonic();
    const keypair = await deriveKeypairFromMnemonic(mnemonic);

    const newAccount: Account = {
      id: generateAccountId(),
      name: `Account ${state.accounts.length + 1}`,
      address: keypair.publicKey.toBase58(),
      publicKey: keypair.publicKey.toBase58(),
      color: getRandomColor(),
      isImported: false,
    };

    await storeKeypair(newAccount.id, keypair);

    setState((prev) => ({
      ...prev,
      accounts: [...prev.accounts, newAccount],
      activeAccountId: newAccount.id,
    }));

    return { mnemonic, account: newAccount };
  }, [state.accounts.length]);

  const importAccount = useCallback(
    async (
      method: "mnemonic" | "privateKey",
      value: string,
    ): Promise<Account> => {
      let keypair: Keypair;

      if (method === "mnemonic") {
        if (!bip39.validateMnemonic(value)) {
          throw new Error("Invalid mnemonic phrase");
        }
        keypair = await deriveKeypairFromMnemonic(value);
      } else {
        keypair = keypairFromPrivateKey(value);
      }

      const newAccount: Account = {
        id: generateAccountId(),
        name: `Account ${state.accounts.length + 1}`,
        address: keypair.publicKey.toBase58(),
        publicKey: keypair.publicKey.toBase58(),
        color: getRandomColor(),
        isImported: true,
      };

      await storeKeypair(newAccount.id, keypair);

      setState((prev) => ({
        ...prev,
        accounts: [...prev.accounts, newAccount],
        activeAccountId: newAccount.id,
      }));

      return newAccount;
    },
    [state.accounts.length],
  );

  const updateAccountName = useCallback((accountId: string, name: string) => {
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((a) =>
        a.id === accountId ? { ...a, name } : a,
      ),
    }));
  }, []);

  const completeOnboarding = useCallback((account: Account) => {
    setState((prev) => ({
      ...prev,
      accounts: [account],
      activeAccountId: account.id,
      isOnboarded: true,
    }));
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    }
  }, []);

  const signTransaction = useCallback(
    async (tx: any) => {
      if (!activeAccount) {
        throw new Error("No active account");
      }
      const keypair = await getKeypairFromStorage(activeAccount.id);
      if (!keypair) {
        throw new Error("Signing key not found");
      }
      const correctTypeKeypair = Keypair.fromSecretKey(keypair.secretKey); //Temp fix for: tx.feePayer.toJSON fails (keypair.publicKey is Uint8Array(32) instead of PublicKey)
      tx.feePayer = correctTypeKeypair.publicKey;
      const latestBlockhash = await fetchRecentBlockhash(); // Temp fix for: Blockhash not found fails.
      tx.recentBlockhash = latestBlockhash; // Temp fix for: Blockhash not found fails.

      tx.partialSign(correctTypeKeypair);
      return tx;
    },
    [activeAccount],
  );

  return (
    <WalletContext.Provider
      value={{
        accounts: state.accounts,
        activeAccount,
        isPrivateMode: state.isPrivateMode,
        balances,
        transactions,
        isLoading,
        isOnboarded: state.isOnboarded,
        setPrivateMode,
        setActiveAccount,
        createNewAccount,
        importAccount,
        updateAccountName,
        refreshBalances,
        refreshTransactions,
        completeOnboarding,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
