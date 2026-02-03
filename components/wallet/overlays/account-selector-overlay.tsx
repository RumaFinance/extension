"use client"

import { useState } from "react"
import { Plus, Download, Check, Copy, X, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountAvatar } from "../account-avatar"
import { useWallet } from "@/contexts/wallet-context"
import { truncateAddress } from "@/lib/blockchain/utils"
import { cn } from "@/lib/utils"

interface AccountSelectorOverlayProps {
  open: boolean
  onClose: () => void
}

export function AccountSelectorOverlay({ open, onClose }: AccountSelectorOverlayProps) {
  const { accounts, activeAccount, setActiveAccount, createNewAccount, importAccount } = useWallet()
  const [view, setView] = useState<"list" | "new" | "import">("list")
  const [newMnemonic, setNewMnemonic] = useState<string | null>(null)
  const [importValue, setImportValue] = useState("")
  const [importType, setImportType] = useState<"mnemonic" | "privateKey">("mnemonic")
  const [mnemonicCopied, setMnemonicCopied] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectAccount = (accountId: string) => {
    setActiveAccount(accountId)
    handleClose()
  }

  const handleCreateNew = async () => {
    setIsCreating(true)
    setError(null)
    try {
      const { mnemonic } = await createNewAccount()
      setNewMnemonic(mnemonic)
    } catch (err) {
      setError("Failed to create account")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyMnemonic = async () => {
    if (newMnemonic) {
      await navigator.clipboard.writeText(newMnemonic)
      setMnemonicCopied(true)
      setTimeout(() => setMnemonicCopied(false), 2000)
    }
  }

  const handleImport = async () => {
    if (!importValue.trim()) return
    setIsImporting(true)
    setError(null)
    try {
      await importAccount(importType, importValue.trim())
      setImportValue("")
      setView("list")
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import account")
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setView("list")
    setNewMnemonic(null)
    setImportValue("")
    setError(null)
    onClose()
  }

  const handleBack = () => {
    setView("list")
    setNewMnemonic(null)
    setImportValue("")
    setError(null)
  }

  if (!open) return null

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 bg-background flex flex-col",
        "animate-in fade-in slide-in-from-top-4 duration-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        {view !== "list" ? (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={handleBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-9" />
        )}
        <h2 className="font-semibold">
          {view === "list" && "Select Account"}
          {view === "new" && "New Account"}
          {view === "import" && "Import Account"}
        </h2>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {view === "list" && (
          <div className="flex flex-col">
            <div className="p-4 flex flex-col gap-1">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <AccountAvatar color={account.color} size="sm" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{truncateAddress(account.address)}</p>
                  </div>
                  {activeAccount?.id === account.id && <Check className="h-5 w-5 text-primary" />}
                </button>
              ))}
            </div>

            <div className="flex gap-2 p-4 pt-0">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setView("new")}>
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setView("import")}>
                <Download className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        )}

        {view === "new" && (
          <div className="p-4">
            {newMnemonic ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Your account has been created. Save this recovery phrase securely - you will need it to recover your
                  wallet.
                </p>
                <div className="p-4 rounded-xl bg-secondary">
                  <div className="grid grid-cols-3 gap-2">
                    {newMnemonic.split(" ").map((word, i) => (
                      <div key={i} className="flex items-center gap-1 text-sm">
                        <span className="text-muted-foreground w-5">{i + 1}.</span>
                        <span className="font-mono">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleCopyMnemonic}>
                    {mnemonicCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button className="flex-1" onClick={handleClose}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Create a new wallet account. You will receive a 12-word recovery phrase to back up your wallet.
                </p>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBack}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleCreateNew} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "import" && (
          <div className="p-4">
            <Tabs value={importType} onValueChange={(v) => setImportType(v as "mnemonic" | "privateKey")}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="mnemonic" className="flex-1">
                  Recovery Phrase
                </TabsTrigger>
                <TabsTrigger value="privateKey" className="flex-1">
                  Private Key
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mnemonic" className="mt-0">
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="mnemonic" className="sr-only">
                      Recovery Phrase
                    </Label>
                    <textarea
                      id="mnemonic"
                      placeholder="Enter your 12 or 24 word recovery phrase"
                      value={importValue}
                      onChange={(e) => setImportValue(e.target.value)}
                      className="w-full h-24 p-3 rounded-xl bg-secondary border-0 resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privateKey" className="mt-0">
                <div className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="privateKey" className="sr-only">
                      Private Key
                    </Label>
                    <Input
                      id="privateKey"
                      placeholder="Enter your private key (base58)"
                      value={importValue}
                      onChange={(e) => setImportValue(e.target.value)}
                      type="password"
                      className="bg-secondary border-0"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {error && <p className="text-sm text-destructive mt-2">{error}</p>}

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleImport} disabled={!importValue.trim() || isImporting}>
                {isImporting ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
