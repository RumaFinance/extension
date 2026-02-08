# Ruma

The human-centered Ethereum wallet. Simple, easy, secure crypto self-custody.

## The Problem

**3 billion people globally lack crypto access** due to three blockers: (1) self-custody complexity overwhelms newcomers, (2) loss of seed phrases leads to irreversible fund loss, (3) centralized exchanges require trusted intermediaries. Current solutions force a false choice between security and usability.

We live in crypto-agnostic countries (LATAM), where people think holding crypto is too difficult, too complex or even dangerous/illegal. When introducing them to how web3 works none of the wallets were easy to use at first: first thing they saw was a list of 20 tokens, no info on how to buy their first crypto and chain switching, oh man, the chain switch! If this wasn't enough, transacting with wallets IRL has always been a pain even for power users: think buying a coffee at Devconnect when the shop takes ETH only on Arbitrum, but the user has USDC on Base, try explaining your friend how to bridge funds and leave some ETH for the transaction to succeed.

Our goal is to onboard all new users without sacrificing self-custody or decentralization (i.e: we don't rely on centralized infrastructure to offer better UX and we are constantly thinking of newer mechanisms to abstract complexity). We have big plans for Ruma adoption in LATAM, which has a lot of potential users that are not entering due to friction.

## The Solution

**Ruma** is a browser extension wallet that bridges crypto accessibility and security through:

- **Simple UX**: Simple Mode for fiat on-ramping (Coinbase Pay integration ready), Pro Mode for multi-chain power users (coming soon).
- **Multi-chain Native**: Ethereum, and EVM-compatible chains unified in single interface with chain abstracion (coming soon).
- **Easy and Secure Backup**: Private keys split between local device + encrypted Google Drive backup (AES-256). Neither alone grants access—requires both + local password.
- **Social Recovery Path**: Architecture supports future multi-sig recovery via trusted contacts (coming soon).

## Overview

## Current Status—Hackathon MVP

- ✅ Simple mode with working transactions
- ✅ Encrypted key backup (AES-256 local + GDrive backup)
- ✅ Google Drive authentication & secure shard upload
- ✅ Ethereum integration (EVM-compatible chains)
- ✅ Balance tracking and token management
- ✅ Onboarding flow (optimized for conversion)

## Architecture: Modular Client-Cloud Defense-in-Depth

(Sui was removed due to no EVM compatibility )
![Architecture](/docs/diagram.png)

**Why It Works:**

- **Hybrid Sharding Attack Surface**: Attaining funds requires compromising both Google account + local device password simultaneously
- **Progressive UX**: Onboarding same UX as traditional fintech (reduce multi-step learning curve to 3 clicks)
- **True Custody**: User maintains control; no centralized signer or escrow

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, rspack
- **Blockchain**: Sui SDK, Ethers.js, Web3.js
- **Encryption**: TweetNaCl.js (NaCl crypto), AES-256
- **Cloud**: Google Drive API (GCP)
- **Backend**: Go (optional validation/indexing)
- **Build**: Next.js, Rspack

## Roadmap (Phase 2+)

- **Q1 2026**: Coinbase Pay integration (fiat → crypto in 60 seconds)
- **Q3 2026**: Private mode (Kohaku)
- **Q3 2026**: Multi-sig social recovery (family recovery instead of centralized backup)
- **Q1 2027**: Mobile app

---

## Immediate Revenue/Impact Vectors

1. **Browser Extension Monetization**: 0% fee Simple Mode → 0.5% fee Pro Mode for advanced swaps
2. **B2B Partnerships**: White-label to regional fintech players entering crypto
3. **Institutional**: Companies adopting Ruma for employee crypto benefits (no liability—users hold keys)
