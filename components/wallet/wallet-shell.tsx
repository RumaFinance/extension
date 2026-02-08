"use client";

import { useState } from "react";
import { WalletHeader } from "./wallet-header";
import { BottomNav, type TabId } from "./bottom-nav";
import { HomeTab } from "./home-tab";
import { ActivityTab } from "./activity-tab";
import { HelpTab } from "./help-tab";
import { AccountSelectorOverlay } from "./overlays/account-selector-overlay";
import { SettingsOverlay } from "./overlays/settings-overlay";
import { TransferModal } from "./modals/transfer-modal";
import { DepositModal } from "./modals/deposit-modal";
import { useWallet } from "@/contexts/wallet-context";
import { cn } from "@/lib/utils";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { useBalances } from "@/hooks/use-balances";

export function WalletShell() {
  const { isPrivateMode, activeAccount } = useWallet();
  const { refetchBalances } = useBalances(activeAccount?.address);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useThemeMode(isPrivateMode);

  return (
    <div
      className={cn(
        "wallet-extension h-full flex flex-col bg-background text-foreground relative",
        "border border-border shadow-2xl overflow-hidden",
      )}
    >
      <WalletHeader onSettingsClick={() => setShowSettings(true)} />

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        {activeTab === "home" && (
          <HomeTab
            onAccountSelectorClick={() => setShowAccountSelector(true)}
            onTransfer={() => setShowTransfer(true)}
            onDeposit={() => setShowDeposit(true)}
          />
        )}
        {activeTab === "activity" && <ActivityTab />}
        {activeTab === "help" && <HelpTab />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <AccountSelectorOverlay
        open={showAccountSelector}
        onClose={() => setShowAccountSelector(false)}
      />
      <SettingsOverlay
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Transfer/deposit/withdraw dialogs */}
      <TransferModal
        open={!isPrivateMode && showTransfer}
        onOpenChange={setShowTransfer}
        onSuccess={refetchBalances}
      />
      <DepositModal
        open={!isPrivateMode && showDeposit}
        onOpenChange={setShowDeposit}
      />
    </div>
  );
}
