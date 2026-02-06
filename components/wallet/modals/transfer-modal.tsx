"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet } from "@/contexts/wallet-context";
import { formatBalance } from "@/lib/blockchain/utils";
import { useBalances } from "@/hooks/use-balances";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TransferModal({
  open,
  onOpenChange,
  onSuccess,
}: TransferModalProps) {
  const { activeAccount, isPrivateMode } = useWallet();
  const { balances } = useBalances({
    address: activeAccount?.address || "",
  });
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedBalance = balances.find(
    (b) => b.token.symbol === selectedToken,
  );
  const maxAmount = isPrivateMode ? 0 : selectedBalance?.balance || 0;

  const handleSend = async () => {
    setError("");

    if (!recipient.trim()) {
      setError("Please enter a recipient address");
      return;
    }

    const amountNum = Number.parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountNum > maxAmount) {
      setError("Insufficient balance");
      return;
    }

    setIsLoading(true);

    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (onSuccess) onSuccess();

    setIsLoading(false);
    setRecipient("");
    setAmount("");
    onOpenChange(false);
  };

  const handleMaxClick = () => {
    setAmount(maxAmount.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px]">
        <DialogHeader>
          <DialogTitle>Send</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="Enter address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-1.5 font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="token">Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger id="token" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {balances.map((b) => (
                  <SelectItem key={b.token.symbol} value={b.token.symbol}>
                    {b.token.symbol} (
                    {formatBalance(isPrivateMode ? 0 : b.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount</Label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs text-primary hover:underline"
              >
                Max: {formatBalance(maxAmount)}
              </button>
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleSend} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
