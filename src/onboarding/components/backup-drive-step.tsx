import { useState } from "react";
import { Download, Check } from "lucide-react";
import { StepProps } from "../types";
import { cn } from "@/lib/utils";
import {
  requestAccessToken,
  getAccessToken,
  encryptText,
  uploadToDrive,
  validateSeedPhrase,
  DEFAULT_SCOPES,
  DriveConfig,
} from "@/lib/drive";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const driveConfig: DriveConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  scopes: DEFAULT_SCOPES,
};

export function BackupDriveStep({
  state,
  setState,
  onNext,
  onBack,
}: StepProps) {
  const [backupPassword, setBackupPassword] = useState("");
  const [backupStatus, setBackupStatus] = useState<string>("");
  const [backupIsLoading, setBackupIsLoading] = useState(false);
  const { completeOnboarding } = useWallet();

  const handleBackupToDrive = async () => {
    if (!state.mnemonic) return;

    setBackupIsLoading(true);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setBackupStatus("Please connect to Google Drive first");
        return;
      }

      if (!validateSeedPhrase(state.mnemonic)) {
        setBackupStatus("Invalid seed phrase");
        return;
      }

      if (!backupPassword) {
        setBackupStatus("Please enter an encryption password");
        return;
      }

      setBackupStatus("Encrypting seed phrase...");

      // Step 1: Encrypt
      const encryptedData = await encryptText(state.mnemonic, backupPassword);
      setBackupStatus("Encryption complete. Uploading to Drive...");

      // Step 2: Upload
      const result = await uploadToDrive(accessToken, encryptedData.blob, {
        name: `ruma_seed_backup_${Date.now()}.enc`,
        mimeType: "application/octet-stream",
      });

      setBackupStatus(`Backup successful! File ID: ${result.id}`);

      // Complete onboarding
      completeOnboarding(state.createdAccount);
      chrome.runtime.sendMessage({ type: "CLOSE_ONBOARDING_TAB" });
    } catch (error) {
      setBackupStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setBackupIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Backup to Google Drive</h1>
        <p className="text-muted-foreground">
          Securely encrypt and backup your recovery phrase
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <Button
          onClick={async () => {
            try {
              setBackupIsLoading(true);
              await requestAccessToken(driveConfig);
              setBackupStatus("Connected to Google Drive!");
            } catch (error) {
              setBackupStatus(
                `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              );
            } finally {
              setBackupIsLoading(false);
            }
          }}
          disabled={backupIsLoading || !!getAccessToken()}
          className="flex items-center gap-2"
        >
          {getAccessToken() ? (
            <>
              <Check className="h-4 w-4" />
              Connected
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Connect Google Drive
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <Label
            htmlFor="backup-password"
            className="block text-sm font-medium mb-1"
          >
            Encryption Password
          </Label>
          <Input
            id="backup-password"
            type="password"
            value={backupPassword}
            onChange={(e) => setBackupPassword(e.target.value)}
            placeholder="Enter a strong password"
            className="bg-secondary border-0"
          />
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleBackupToDrive}
          disabled={backupIsLoading || !backupPassword}
        >
          {backupIsLoading ? "Processing..." : "Backup to Google Drive"}
        </Button>

        <button
          onClick={() => onBack("backup-choice")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back
        </button>
      </div>

      {backupStatus && (
        <div
          className={cn(
            "p-3 rounded-xl",
            backupStatus.includes("successful")
              ? "bg-green-50/50 border border-green-200"
              : backupStatus.includes("Error")
                ? "bg-destructive/10 border border-destructive/20"
                : "bg-secondary",
          )}
        >
          <p
            className={cn(
              "text-sm",
              backupStatus.includes("successful")
                ? "text-green-700"
                : backupStatus.includes("Error")
                  ? "text-destructive"
                  : "text-muted-foreground",
            )}
          >
            {backupStatus}
          </p>
        </div>
      )}
    </div>
  );
}
