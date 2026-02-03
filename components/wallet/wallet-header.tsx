"use client"

import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/contexts/wallet-context"

interface WalletHeaderProps {
  onSettingsClick: () => void
}

export function WalletHeader({ onSettingsClick }: WalletHeaderProps) {
  const { isPrivateMode, setPrivateMode } = useWallet()

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full bg-secondary hover:bg-secondary/80"
        onClick={onSettingsClick}
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <Label htmlFor="private-mode" className="text-xs text-muted-foreground">
          Private
        </Label>
        <Switch
          id="private-mode"
          checked={isPrivateMode}
          onCheckedChange={setPrivateMode}
          aria-label="Toggle private mode"
        />
      </div>
    </header>
  )
}
