"use client";

import { useState } from "react";
import {
  Plus,
  Download,
  Check,
  Copy,
  ChevronRight,
  Shield,
  Eye,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useWallet } from "../contexts/wallet-context";
import { cn } from "../lib/utils";

type OnboardingStep = "welcome" | "choice" | "create" | "confirm" | "import";

function OnboardingFlow() {
  const { createNewAccount, importAccount, completeOnboarding } = useWallet();

  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [createdAccount, setCreatedAccount] = useState<{
    id: string;
    name: string;
    address: string;
    publicKey: string;
    color: string;
    isImported: boolean;
  } | null>(null);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const [confirmWords, setConfirmWords] = useState<string[]>(["", "", ""]);
  const [confirmIndices] = useState<number[]>(() => {
    // Pick 3 random indices
    const indices: number[] = [];
    while (indices.length < 3) {
      const idx = Math.floor(Math.random() * 12);
      if (!indices.includes(idx)) indices.push(idx);
    }
    return indices.sort((a, b) => a - b);
  });
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [importValue, setImportValue] = useState("");
  const [importType, setImportType] = useState<"mnemonic" | "privateKey">(
    "mnemonic",
  );
  const [importError, setImportError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  const handleCreateNew = async () => {
    setIsLoading(true);
    try {
      const { mnemonic: newMnemonic, account } = await createNewAccount();
      setMnemonic(newMnemonic);
      setMnemonicWords(newMnemonic.split(" "));
      setCreatedAccount(account);
      setStep("create");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMnemonic = async () => {
    if (mnemonic) {
      await navigator.clipboard.writeText(mnemonic);
      setMnemonicCopied(true);
      setTimeout(() => setMnemonicCopied(false), 2000);
    }
  };

  const handleConfirmMnemonic = () => {
    // Verify the user entered correct words
    const isCorrect = confirmIndices.every(
      (idx, i) => confirmWords[i].toLowerCase().trim() === mnemonicWords[idx],
    );

    if (!isCorrect) {
      setConfirmError("The words you entered don't match. Please try again.");
      return;
    }

    if (createdAccount) {
      completeOnboarding(createdAccount);
      // Close the onboarding tab
      chrome.runtime.sendMessage({ type: "CLOSE_ONBOARDING_TAB" });
      // TODO: Trigger extension open
    }
  };

  const handleImport = async () => {
    if (!importValue.trim()) return;
    setIsLoading(true);
    setImportError(null);
    try {
      const account = await importAccount(importType, importValue.trim());
      completeOnboarding(account);
      // Close the onboarding tab
      chrome.runtime.sendMessage({ type: "CLOSE_ONBOARDING_TAB" });
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Failed to import account",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-xl">Ruma Wallet</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        {step === "welcome" && (
          <div className="flex flex-col items-center text-center gap-6 animate-in fade-in duration-300">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome to your Ruma</h1>
              <p className="text-muted-foreground">
                The crypto wallet made for humans. Simple, easy and secure.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => setStep("choice")}
            >
              Get Started
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {step === "choice" && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Set Up Your Wallet</h1>
              <p className="text-muted-foreground">
                Create a new wallet or import an existing one
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCreateNew}
                disabled={isLoading}
                className="flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Create New Wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Generate a new recovery phrase
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <button
                onClick={() => setStep("import")}
                className="flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Import Existing Wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Use recovery phrase or private key
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <button
              onClick={() => setStep("welcome")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        )}

        {step === "create" && mnemonic && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Your Recovery Phrase</h1>
              <p className="text-muted-foreground">
                Write down these 12 words in order. Never share them with
                anyone.
              </p>
            </div>

            <div className="relative">
              <div
                className={cn(
                  "p-4 rounded-xl bg-secondary",
                  !showMnemonic && "select-none",
                )}
              >
                <div
                  className={cn(
                    "grid grid-cols-3 gap-3",
                    !showMnemonic && "blur-md",
                  )}
                >
                  {mnemonicWords.map((word, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm bg-background rounded-lg p-2"
                    >
                      <span className="text-muted-foreground w-5">
                        {i + 1}.
                      </span>
                      <span className="font-mono font-medium">{word}</span>
                    </div>
                  ))}
                </div>
              </div>
              {!showMnemonic && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setShowMnemonic(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Reveal Recovery Phrase
                  </Button>
                </div>
              )}
            </div>

            {showMnemonic && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCopyMnemonic}
                  className="w-full bg-transparent"
                >
                  {mnemonicCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>

                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">
                    Warning: Never share your recovery phrase. Anyone with these
                    words can access your funds.
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setStep("confirm")}
                >
                  I've Saved My Recovery Phrase
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}

            <button
              onClick={() => setStep("choice")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        )}

        {step === "confirm" && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">
                Confirm Recovery Phrase
              </h1>
              <p className="text-muted-foreground">
                Enter the words at the following positions to verify
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {confirmIndices.map((idx, i) => (
                <div key={idx}>
                  <Label
                    htmlFor={`word-${i}`}
                    className="text-sm text-muted-foreground mb-1 block"
                  >
                    Word #{idx + 1}
                  </Label>
                  <Input
                    id={`word-${i}`}
                    value={confirmWords[i]}
                    onChange={(e) => {
                      const newWords = [...confirmWords];
                      newWords[i] = e.target.value;
                      setConfirmWords(newWords);
                      setConfirmError(null);
                    }}
                    placeholder={`Enter word #${idx + 1}`}
                    className="bg-secondary border-0"
                  />
                </div>
              ))}
            </div>

            {confirmError && (
              <p className="text-sm text-destructive text-center">
                {confirmError}
              </p>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleConfirmMnemonic}
              disabled={confirmWords.some((w) => !w.trim())}
            >
              Confirm
            </Button>

            <button
              onClick={() => setStep("create")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        )}

        {step === "import" && (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Import Wallet</h1>
              <p className="text-muted-foreground">
                Enter your recovery phrase or private key
              </p>
            </div>

            <Tabs
              value={importType}
              onValueChange={(v) =>
                setImportType(v as "mnemonic" | "privateKey")
              }
            >
              <TabsList className="w-full">
                <TabsTrigger value="mnemonic" className="flex-1">
                  Recovery Phrase
                </TabsTrigger>
                <TabsTrigger value="privateKey" className="flex-1">
                  Private Key
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mnemonic" className="mt-4">
                <div>
                  <Label htmlFor="import-mnemonic" className="sr-only">
                    Recovery Phrase
                  </Label>
                  <textarea
                    id="import-mnemonic"
                    placeholder="Enter your 12 or 24 word recovery phrase, separated by spaces"
                    value={importValue}
                    onChange={(e) => {
                      setImportValue(e.target.value);
                      setImportError(null);
                    }}
                    className="w-full h-32 p-4 rounded-xl bg-secondary border-0 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </TabsContent>

              <TabsContent value="privateKey" className="mt-4">
                <div>
                  <Label htmlFor="import-key" className="sr-only">
                    Private Key
                  </Label>
                  <Input
                    id="import-key"
                    placeholder="Enter your private key (base58)"
                    value={importValue}
                    onChange={(e) => {
                      setImportValue(e.target.value);
                      setImportError(null);
                    }}
                    type="password"
                    className="bg-secondary border-0"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {importError && (
              <p className="text-sm text-destructive text-center">
                {importError}
              </p>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleImport}
              disabled={!importValue.trim() || isLoading}
            >
              {isLoading ? "Importing..." : "Import Wallet"}
            </Button>

            <button
              onClick={() => setStep("choice")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-muted-foreground">Connected to Ethereum</p>
      </footer>
    </div>
  );
}

export default OnboardingFlow;
