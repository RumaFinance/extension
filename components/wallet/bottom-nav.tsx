"use client"

import { Home, Clock, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type TabId = "home" | "activity" | "help"

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs = [
  { id: "home" as const, icon: Home, label: "Home" },
  { id: "activity" as const, icon: Clock, label: "Activity" },
  { id: "help" as const, icon: HelpCircle, label: "Help" },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="flex items-center justify-around px-4 py-3 border-t border-border bg-card">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={cn(
            "flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors",
            activeTab === id ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label={label}
          aria-current={activeTab === id ? "page" : undefined}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </nav>
  )
}
