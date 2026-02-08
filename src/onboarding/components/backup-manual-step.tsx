import { useState } from "react";
import { Eye, Check, Copy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepProps } from "../types";
import { cn } from "@/lib/utils";

export function BackupManualStep({
  state,
  setState,
  onNext,
  onBack,
}: StepProps) {
  const [showMnemonic, setShowMnemonic] = useState(false);

  const handleCopyMnemonic = async () => {
    if (state.mnemonic) {
      await navigator.clipboard.writeText(state.mnemonic);
      setState({ mnemonicCopied: true });
      setTimeout(() => setState({ mnemonicCopied: false }), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Your Recovery Phrase</h1>
        <p className="text-muted-foreground">
          Write down these 12 words in order. Never share them with anyone.
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
            className={cn("grid grid-cols-3 gap-3", !showMnemonic && "blur-md")}
          >
            {state.mnemonicWords.map((word, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm bg-background rounded-lg p-2"
              >
                <span className="text-muted-foreground w-5">{i + 1}.</span>
                <span className="font-mono font-medium">{word}</span>
              </div>
            ))}
          </div>
        </div>
        {!showMnemonic && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button variant="secondary" onClick={() => setShowMnemonic(true)}>
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
            {state.mnemonicCopied ? (
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
              Warning: Never share your recovery phrase. Anyone with these words
              can access your funds.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full"
              onClick={() => onNext("confirm")}
            >
              I've Saved My Recovery Phrase
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <button
            onClick={() => onBack("backup-choice")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back
          </button>
        </>
      )}
    </div>
  );
}
