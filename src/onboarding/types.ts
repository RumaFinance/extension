export type OnboardingStep =
  | "welcome"
  | "choice"
  | "backup-manual"
  | "backup-choice"
  | "backup-drive"
  | "confirm"
  | "import";

export interface OnboardingState {
  step: OnboardingStep;
  mnemonic: string | null;
  mnemonicWords: string[];
  createdAccount: {
    id: string;
    name: string;
    address: string;
    publicKey: string;
    color: string;
    isImported: boolean;
  } | null;
  mnemonicCopied: boolean;
  confirmWords: string[];
  confirmIndices: number[];
  confirmError: string | null;
  importValue: string;
  importType: "mnemonic" | "privateKey";
  importError: string | null;
  isLoading: boolean;
  showMnemonic: boolean;
  backupMnemonic: string | null;
  backupPassword: string;
  backupStatus: string;
  backupIsLoading: boolean;
}

export interface StepProps {
  state: OnboardingState;
  setState: (updates: Partial<OnboardingState>) => void;
  onNext: (nextStep: OnboardingStep) => void;
  onBack: (prevStep: OnboardingStep) => void;
  onCreateNew: () => Promise<void>;
  onImport: () => Promise<void>;
  onConfirmMnemonic: () => void;
  onCopyMnemonic: () => Promise<void>;
}
