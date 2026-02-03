"use client"

import { ChevronRight, Shield, Key, Trash2, Moon, Sun, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"
import { cn } from "@/lib/utils"

interface SettingsOverlayProps {
  open: boolean
  onClose: () => void
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

export function SettingsOverlay({ open, onClose }: SettingsOverlayProps) {
  const { isPrivateMode } = useWallet()

  if (!open) return null

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 bg-background flex flex-col",
        "animate-in fade-in slide-in-from-right-4 duration-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Settings</h2>
          {isPrivateMode ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4" />}
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col py-2">
          {settingsItems.map(({ icon: Icon, title, description, danger }) => (
            <button
              key={title}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  danger ? "bg-destructive/10 text-destructive" : "bg-secondary text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className={cn("font-medium", danger && "text-destructive")}>{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">Version 1.0.0</p>
      </div>
    </div>
  )
}
