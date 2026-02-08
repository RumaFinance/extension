import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProps } from "../types";
import { useWallet } from "@/contexts/wallet-context";

export function ConfirmStep({ state, setState, onNext, onBack }: StepProps) {
  const [confirmWords, setConfirmWords] = useState<string[]>(["", "", ""]);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const { completeOnboarding } = useWallet();

  const handleConfirmMnemonic = () => {
    // Verify the user entered correct words
    const isCorrect = state.confirmIndices.every(
      (idx, i) =>
        confirmWords[i].toLowerCase().trim() === state.mnemonicWords[idx],
    );

    if (!isCorrect) {
      setConfirmError("The words you entered don't match. Please try again.");
      return;
    }

    if (state.createdAccount) {
      // Complete onboarding and close tab
      setState({ confirmError: null });
      completeOnboarding(state.createdAccount);
      chrome.runtime.sendMessage({ type: "CLOSE_ONBOARDING_TAB" });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Confirm Recovery Phrase</h1>
        <p className="text-muted-foreground">
          Enter the words at the following positions to verify
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {state.confirmIndices.map((idx, i) => (
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
        <p className="text-sm text-destructive text-center">{confirmError}</p>
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
        onClick={() => onBack("backup-manual")}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Back
      </button>
    </div>
  );
}
