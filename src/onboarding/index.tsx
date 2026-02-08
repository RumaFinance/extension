"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { useWallet } from "@/contexts/wallet-context";
import { OnboardingStep, OnboardingState } from "./types";
import { WelcomeStep } from "./components/welcome-step";
import { ChoiceStep } from "./components/choice-step";
import { BackupChoiceStep } from "./components/backup-choice-step";
import { BackupDriveStep } from "./components/backup-drive-step";
import { BackupManualStep } from "./components/backup-manual-step";
import { ConfirmStep } from "./components/confirm-step";
import { ImportStep } from "./components/import-step";

export default function OnboardingFlow() {
  const { createNewAccount, importAccount, completeOnboarding } = useWallet();

  const [state, setState] = useState<OnboardingState>({
    step: "welcome",
    mnemonic: null,
    mnemonicWords: [],
    createdAccount: null,
    mnemonicCopied: false,
    confirmWords: ["", "", ""],
    confirmIndices: (() => {
      const indices: number[] = [];
      while (indices.length < 3) {
        const idx = Math.floor(Math.random() * 12);
        if (!indices.includes(idx)) indices.push(idx);
      }
      return indices.sort((a, b) => a - b);
    })(),
    confirmError: null,
    importValue: "",
    importType: "mnemonic",
    importError: null,
    isLoading: false,
    showMnemonic: false,
    backupMnemonic: null,
    backupPassword: "",
    backupStatus: "",
    backupIsLoading: false,
  });

  const updateState = (updates: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = (nextStep: OnboardingStep) => {
    updateState({ step: nextStep });
  };

  const handleBack = (prevStep: OnboardingStep) => {
    updateState({ step: prevStep });
  };

  const handleCreateNew = async () => {
    updateState({ isLoading: true });
    try {
      const { mnemonic: newMnemonic, account } = await createNewAccount();
      updateState({
        mnemonic: newMnemonic,
        mnemonicWords: newMnemonic.split(" "),
        createdAccount: account,
        step: "backup-choice",
      });
    } catch (err) {
      console.error(err);
    } finally {
      updateState({ isLoading: false });
    }
  };

  const handleImport = async () => {
    if (!state.importValue.trim()) return;
    updateState({ isLoading: true, importError: null });
    try {
      const account = await importAccount(
        state.importType,
        state.importValue.trim(),
      );
      completeOnboarding(account);
      chrome.runtime.sendMessage({ type: "CLOSE_ONBOARDING_TAB" });
    } catch (err) {
      updateState({
        importError:
          err instanceof Error ? err.message : "Failed to import account",
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const handleConfirmMnemonic = () => {
    const isCorrect = state.confirmIndices.every(
      (idx, i) =>
        state.confirmWords[i].toLowerCase().trim() === state.mnemonicWords[idx],
    );

    if (!isCorrect) {
      updateState({
        confirmError: "The words you entered don't match. Please try again.",
      });
      return;
    }

    if (state.createdAccount) {
      completeOnboarding(state.createdAccount);
      chrome.runtime.sendMessage({ type: "CLOSE_ONBOARDING_TAB" });
    }
  };

  const handleCopyMnemonic = async () => {
    if (state.mnemonic) {
      await navigator.clipboard.writeText(state.mnemonic);
      updateState({ mnemonicCopied: true });
      setTimeout(() => updateState({ mnemonicCopied: false }), 2000);
    }
  };

  const stepProps = {
    state,
    setState: updateState,
    onNext: handleNext,
    onBack: handleBack,
    onCreateNew: handleCreateNew,
    onImport: handleImport,
    onConfirmMnemonic: handleConfirmMnemonic,
    onCopyMnemonic: handleCopyMnemonic,
  };

  const renderStep = () => {
    switch (state.step) {
      case "welcome":
        return <WelcomeStep {...stepProps} />;
      case "choice":
        return <ChoiceStep {...stepProps} />;
      case "backup-choice":
        return <BackupChoiceStep {...stepProps} />;
      case "backup-drive":
        return <BackupDriveStep {...stepProps} />;
      case "backup-manual":
        return <BackupManualStep {...stepProps} />;
      case "confirm":
        return <ConfirmStep {...stepProps} />;
      case "import":
        return <ImportStep {...stepProps} />;
      default:
        return <WelcomeStep {...stepProps} />;
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
        {renderStep()}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-muted-foreground">Connected to Ethereum</p>
      </footer>
    </div>
  );
}
