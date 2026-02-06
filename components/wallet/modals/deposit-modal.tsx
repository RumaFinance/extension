"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/wallet-context";
import { useTheme } from "next-themes";
import { useBalances } from "@/hooks/use-balances";

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const { activeAccount } = useWallet();
  const { refetchBalances } = useBalances({
    address: activeAccount?.address || "",
  });
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = async () => {
    if (activeAccount) {
      await navigator.clipboard.writeText(activeAccount.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const refreshBalanceIfClosed = () => {
    if (open) {
      refetchBalances();
    }
    onOpenChange(!open);
  };

  if (!activeAccount) return null;

  return (
    <Dialog open={open} onOpenChange={refreshBalanceIfClosed}>
      <DialogContent className="max-w-[340px]">
        <DialogHeader>
          <DialogTitle>Deposit</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Send SOL or USDC to this address to deposit into your wallet.
          </p>

          {/* Dynamic QR Code */}
          <div className="h-48 w-48 rounded-xl bg-secondary flex items-center justify-center">
            <QRCodeSVG
              value={activeAccount.address}
              size={192}
              marginSize={3}
              level="H"
            />
          </div>

          <div className="w-full p-3 rounded-xl bg-secondary">
            <p className="text-xs text-muted-foreground mb-1">Your Address</p>
            <p className="font-mono text-sm break-all">
              {activeAccount.address}
            </p>
          </div>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full bg-transparent"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Address
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
