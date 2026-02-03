"use client";

import { AccountInfo } from "./account-info";
import { ActionButtons } from "./action-buttons";
import { BalanceList } from "./balance-list";

interface HomeTabProps {
  onAccountSelectorClick: () => void;
  onTransfer: () => void;
  onDeposit: () => void;
}

export function HomeTab({
  onAccountSelectorClick,
  onTransfer,
  onDeposit,
}: HomeTabProps) {
  return (
    <div className="flex flex-col gap-2">
      <AccountInfo onAccountSelectorClick={onAccountSelectorClick} />
      <ActionButtons onTransfer={onTransfer} onDeposit={onDeposit} />
      <BalanceList />
    </div>
  );
}
