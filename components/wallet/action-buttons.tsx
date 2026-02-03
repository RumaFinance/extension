"use client";

import { Send, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onTransfer: () => void;
  onDeposit: () => void;
}

export function ActionButtons({ onTransfer, onDeposit }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-4 px-4 py-4">
      <div className="flex flex-col items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors bg-transparent"
          onClick={onTransfer}
          aria-label="Transfer"
        >
          <Send className="h-5 w-5" />
        </Button>
        <span className="text-xs text-muted-foreground">Send</span>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors bg-transparent"
          onClick={onDeposit}
          aria-label="Deposit"
        >
          <ArrowDownToLine className="h-5 w-5" />
        </Button>
        <span className="text-xs text-muted-foreground">Deposit</span>
      </div>
    </div>
  );
}
