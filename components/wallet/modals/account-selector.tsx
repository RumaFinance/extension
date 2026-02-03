"use client"

import { useState } from "react"
import { Plus, Download, Check, Copy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountAvatar } from "../account-avatar"
import { useWallet } from "@/contexts/wallet-context"
import { truncateAddress } from "@/lib/blockchain/utils"

interface AccountSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountSelector({ open, onOpenChange }: AccountSelectorProps) {
  const { accounts, activeAccount, setActiveAccount, createNewAccount, importAccount } = useWallet()
  const [view, setView] = useState<"list" | "new" | "import">("list")
  const [newMnemonic, setNewMnemonic] = useState<string | null>(null)
  const [importValue, setImportValue] = useState("")
  const [importType, setImportType] = useState<"mnemonic" | "privateKey">("mnemonic")
  const [mnemonicCopied, setMnemonicCopied] = useState(false)

  const handleSelectAccount = (accountId: string) => {
    setActiveAccount(accountId)
    onOpenChange(false)
  }

  const handleCreateNew = async () => {
    const { mnemonic } = await createNewAccount()
    setNewMnemonic(mnemonic)
  }

  const handleCopyMnemonic = async () => {
    if (newMnemonic) {
      await navigator.clipboard.writeText(newMnemonic)
      setMnemonicCopied(true)
      setTimeout(() => setMnemonicCopied(false), 2000)
    }
  }

  const handleImport = async () => {
    if (importValue.trim()) {
      await importAccount(importType, importValue.trim())
      setImportValue("")
      setView("list")
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    setView("list")
    setNewMnemonic(null)
    setImportValue("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[340px] p-0 gap-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>
            {view === "list" && "Select Account"}
            {view === "new" && "New Account"}
            {view === "import" && "Import Account"}
          </DialogTitle>
        </DialogHeader>

        {view === "list" && (
          <div className="flex flex-col">
            <div className="max-h-[300px] overflow-y-auto p-4 pt-2">
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
          <div className="p-4 pt-2">
            {newMnemonic ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-secondary">
                  <p className="text-sm text-muted-foreground mb-2">Save this recovery phrase securely:</p>
                  <p className="font-mono text-sm leading-relaxed break-words">{newMnemonic}</p>
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
                  Create a new wallet account. You will receive a recovery phrase to back up your wallet.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setView("list")}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleCreateNew}>
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === "import" && (
          <div className="p-4 pt-2">
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
                    <Input
                      id="mnemonic"
                      placeholder="Enter your 12 or 24 word recovery phrase"
                      value={importValue}
                      onChange={(e) => setImportValue(e.target.value)}
                      className="h-24"
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
                      placeholder="Enter your private key"
                      value={importValue}
                      onChange={(e) => setImportValue(e.target.value)}
                      type="password"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setView("list")}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleImport} disabled={!importValue.trim()}>
                Import
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
