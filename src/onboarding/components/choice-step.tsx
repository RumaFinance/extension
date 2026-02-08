import { Plus, Download, ChevronRight } from "lucide-react";
import { StepProps } from "../types";

export function ChoiceStep({ state, onCreateNew, onNext, onBack }: StepProps) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Set Up Your Wallet</h1>
        <p className="text-muted-foreground">
          Create a new wallet or import an existing one
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onCreateNew}
          disabled={state.isLoading}
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
          onClick={() => onNext("import")}
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
        onClick={() => onBack("welcome")}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Back
      </button>
    </div>
  );
}
