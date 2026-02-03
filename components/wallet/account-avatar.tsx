"use client"

import { cn } from "@/lib/utils"

interface AccountAvatarProps {
  color: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function AccountAvatar({ color, size = "md", className }: AccountAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  return (
    <div
      className={cn("rounded-full flex-shrink-0", sizeClasses[size], className)}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}
