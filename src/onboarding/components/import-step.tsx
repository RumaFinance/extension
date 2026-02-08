import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StepProps } from "../types";

export function ImportStep({ state, setState, onNext, onBack }: StepProps) {
  const [importValue, setImportValue] = useState("");
  const [importType, setImportType] = useState<"mnemonic" | "privateKey">(
    "mnemonic",
  );

  const handleImport = async () => {
    if (!importValue.trim()) return;

    setState({
      isLoading: true,
      importError: null,
      importValue,
      importType,
    });

    try {
      await state.onImport();
    } catch (err) {
      setState({
        importError:
          err instanceof Error ? err.message : "Failed to import account",
        isLoading: false,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Import Wallet</h1>
        <p className="text-muted-foreground">
          Enter your recovery phrase or private key
        </p>
      </div>

      <Tabs
        value={importType}
        onValueChange={(v) => setImportType(v as "mnemonic" | "privateKey")}
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
                setState({ importError: null });
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
                setState({ importError: null });
              }}
              type="password"
              className="bg-secondary border-0"
            />
          </div>
        </TabsContent>
      </Tabs>

      {state.importError && (
        <p className="text-sm text-destructive text-center">
          {state.importError}
        </p>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleImport}
        disabled={!importValue.trim() || state.isLoading}
      >
        {state.isLoading ? "Importing..." : "Import Wallet"}
      </Button>

      <button
        onClick={() => onBack("choice")}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Back
      </button>
    </div>
  );
}
