// Core types for multi-chain wallet support
// This file is designed to be extensible for EVM chains

export type ChainType = "evm" | "solana";

export interface Token {
  symbol: string;
  name: string;
  mint: string; // contract address for EVM
  decimals: number;
  logoUrl: string;
}

export interface TokenBalance {
  token: Token;
  balance: number;
  usdValue: number;
}

export interface Account {
  id: string;
  name: string;
  address: string;
  publicKey: string;
  color: string; // For avatar background
  isImported: boolean;
}

export interface Transaction {
  signature: string;
  timestamp: number;
  type: "send" | "receive" | "deposit" | "withdraw" | "swap" | "unknown";
  amount: number;
  token: Token;
  from: string;
  to: string;
  status: "confirmed" | "pending" | "failed";
  fee?: number;
  gasLimit?: number;
  gasPrice?: number;
  nonce?: number;
}

export interface WalletState {
  accounts: Account[];
  activeAccountId: string;
  isPrivateMode: boolean;
  isOnboarded: boolean; // Added for onboarding flow
}

// Chain-agnostic interface for wallet operations
export interface ChainAdapter {
  chainType: ChainType;
  getBalance(address: string, token: Token): Promise<number>;
  getTransactions(address: string, limit?: number): Promise<Transaction[]>;
  createAccount(): Promise<{ address: string; mnemonic: string }>;
  importFromMnemonic(mnemonic: string): Promise<string>;
  importFromPrivateKey(privateKey: string): Promise<string>;
  transfer(
    from: string,
    to: string,
    amount: number,
    token: Token,
  ): Promise<string>;
}
