"use client";

import { useState } from "react";
import { ChevronDown, Copy, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountAvatar } from "./account-avatar";
import { useWallet } from "@/contexts/wallet-context";
import { truncateAddressSimple } from "@/lib/blockchain/utils";
import { useQuery } from "@tanstack/react-query";
import { formatUsdValue } from "@/lib/blockchain/utils";

interface AccountInfoProps {
  onAccountSelectorClick: () => void;
}

export function AccountInfo({ onAccountSelectorClick }: AccountInfoProps) {
  const { activeAccount, updateAccountName, balances } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [copied, setCopied] = useState(false);

  if (!activeAccount) return null;

  const fetchTotalUsdValue = async (): Promise<number> => {
    if (!activeAccount) return 0;
    return balances.reduce((sum, balance) => sum + balance.usdValue, 0);
  };

  const { data: totalUsdValue, refetch } = useQuery({
    queryKey: ["accountTotalUsdValue", activeAccount?.id],
    queryFn: fetchTotalUsdValue,
    refetchInterval: 10000, // 30 seconds
    enabled: !!activeAccount,
  });

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(activeAccount.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setEditedName(activeAccount.name);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedName.trim()) {
      updateAccountName(activeAccount.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName("");
  };

  return (
    <div className="flex flex-col items-left gap-1 px-4 py-4">
      <div className="flex flex-row gap-3 items-center">
        <AccountAvatar color={activeAccount.color} size="sm" />
        {/* Account Name */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-8 w-32 text-center text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleSaveEdit}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCancelEdit}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <span className="text-lg font-semibold">
                {activeAccount.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleStartEdit}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Address with Copy and Account Selector */}
      <div className="flex items-center gap-1">
        <code className="text-sm text-muted-foreground font-mono">
          {truncateAddressSimple(activeAccount.address)}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCopyAddress}
          aria-label={copied ? "Copied" : "Copy address"}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onAccountSelectorClick}
          aria-label="Select account"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Total USD Value */}
      <div className="flex">
        <span className="text-4xl font-semibold">
          {totalUsdValue !== undefined
            ? formatUsdValue(totalUsdValue)
            : "Loading..."}
        </span>
      </div>
    </div>
  );
}
