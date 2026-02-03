"use client"

import { ChevronRight, Shield, Key, Trash2, Moon, Sun } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useWallet } from "@/contexts/wallet-context"

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const settingsItems = [
  {
    icon: Key,
    title: "Export Recovery Phrase",
    description: "Backup your wallet",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Password and biometrics",
  },
  {
    icon: Trash2,
    title: "Remove Account",
    description: "Delete this account",
    danger: true,
  },
]

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { isPrivateMode } = useWallet()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] p-0 gap-0">
        <DialogHeader className="p-4">
          <DialogTitle className="flex items-center gap-2">
            Settings
            {isPrivateMode ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4" />}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col pb-4">
          {settingsItems.map(({ icon: Icon, title, description, danger }) => (
            <button
              key={title}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  danger ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${danger ? "text-destructive" : ""}`}>{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        <div className="px-4 pb-4">
          <p className="text-xs text-center text-muted-foreground">Version 1.0.0</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
