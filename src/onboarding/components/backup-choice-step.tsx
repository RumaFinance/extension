import { Download, Eye, ChevronRight } from "lucide-react";
import { StepProps } from "../types";

export function BackupChoiceStep({ 
  state, 
  onNext, 
  onBack 
}: StepProps) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          Backup Your Recovery Phrase
        </h1>
        <p className="text-muted-foreground">
          Choose how you want to backup your recovery phrase
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onNext("backup-drive")}
          className="flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Backup to Google Drive</p>
            <p className="text-sm text-muted-foreground">
              Securely encrypt and backup to your Google Drive
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        <button
          onClick={() => onNext("backup-manual")}
          className="flex items-center gap-4 p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Backup Manually</p>
            <p className="text-sm text-muted-foreground">
              Write down your recovery phrase securely
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <button
        onClick={() => onBack("choice")}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Back
      </button>
    </div>
  );
}
