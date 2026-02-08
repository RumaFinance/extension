"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { ethers } from "ethers";
import type {
  Account,
  WalletState,
  TokenBalance,
  Transaction,
} from "@/lib/blockchain/types";
import {
  ETH_TOKEN,
  USDC_TOKEN,
  WALLET_STATE_KEY,
  ONBOARDING_COMPLETE_KEY,
  SUPPORTED_TOKENS,
} from "@/lib/blockchain/constants";
import { getRandomColor, generateAccountId } from "@/lib/blockchain/utils";
import {
  getAllBalances,
  getTransactions as fetchEthereumTransactions,
} from "@/lib/blockchain/ethereum-client";
import * as bip39 from "bip39";

interface WalletContextType {
  // State
  accounts: Account[];
  activeAccount: Account | null;
  isPrivateMode: boolean;
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
  refreshTransactions: () => Promise<void>;
  completeOnboarding: (account: Account) => void;
  signTransaction: (tx: ethers.TransactionRequest) => Promise<string>;
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
): Promise<string | null> {
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
  privateKey: string,
): Promise<void> {
  return new Promise((resolve) => {
    const transaction = indexedDB.open("WalletDB", 1);
    transaction.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(privateKey, accountId);
      tx.oncomplete = () => resolve();
    };
  });
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

async function deriveKeypairFromMnemonic(mnemonic: string): Promise<string> {
  // Trim whitespace and normalize the mnemonic
  const trimmedMnemonic = mnemonic.trim().toLowerCase();

  // Validate mnemonic length and format
  if (!bip39.validateMnemonic(trimmedMnemonic)) {
    throw new Error("Invalid mnemonic phrase");
  }

  // Use bip39 to convert mnemonic to seed
  const wallet = ethers.Wallet.fromPhrase(trimmedMnemonic);
  return wallet.privateKey;
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
      refreshTransactions();
    }
  }, [refreshTransactions, state.isOnboarded]);

  const setPrivateMode = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, isPrivateMode: enabled }));
  }, []);

  const setActiveAccount = useCallback((accountId: string) => {
    setState((prev) => ({ ...prev, activeAccountId: accountId }));
  }, []);

  const createNewAccount = useCallback(async () => {
    // Generate real BIP39 mnemonic
    const mnemonic = bip39.generateMnemonic();
    const privateKey = await deriveKeypairFromMnemonic(mnemonic);

    const wallet = new ethers.Wallet(privateKey);
    const newAccount: Account = {
      id: generateAccountId(),
      name: `Account ${state.accounts.length + 1}`,
      address: wallet.address,
      publicKey: wallet.address,
      color: getRandomColor(),
      isImported: false,
    };

    await storeKeypair(newAccount.id, privateKey);

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
      let privateKey: string;

      if (method === "mnemonic") {
        if (!bip39.validateMnemonic(value)) {
          throw new Error("Invalid mnemonic phrase");
        }
        privateKey = await deriveKeypairFromMnemonic(value);
      } else {
        privateKey = value;
        if (!ethers.isHexString(value) || value.length !== 66) {
          throw new Error("Invalid private key");
        }
      }

      const wallet = new ethers.Wallet(privateKey);
      const newAccount: Account = {
        id: generateAccountId(),
        name: `Account ${state.accounts.length + 1}`,
        address: wallet.address,
        publicKey: wallet.address,
        color: getRandomColor(),
        isImported: true,
      };

      await storeKeypair(newAccount.id, privateKey);

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
    async (tx: ethers.TransactionRequest) => {
      if (!activeAccount) {
        throw new Error("No active account");
      }
      const privateKey = await getKeypairFromStorage(activeAccount.id);
      if (!privateKey) {
        throw new Error("Signing key not found");
      }

      const wallet = new ethers.Wallet(privateKey);
      const signedTx = await wallet.signTransaction(tx);
      return signedTx;
    },
    [activeAccount],
  );

  return (
    <WalletContext.Provider
      value={{
        accounts: state.accounts,
        activeAccount,
        isPrivateMode: state.isPrivateMode,
        transactions,
        isLoading,
        isOnboarded: state.isOnboarded,
        setPrivateMode,
        setActiveAccount,
        createNewAccount,
        importAccount,
        updateAccountName,
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
