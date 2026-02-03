import { useEffect } from "react";
import { WalletShell } from "../components/wallet/wallet-shell";
import { useWallet } from "../contexts/wallet-context";

export default function App() {
  const { isOnboarded } = useWallet();

  useEffect(() => {
    if (!isOnboarded) {
      // Send message to service worker to open onboarding tab
      chrome.runtime.sendMessage({ type: "OPEN_ONBOARDING" });
      // Close the popup
      window.close();
    }
  }, [isOnboarded]);

  if (!isOnboarded) {
    return (
      <div className="flex items-center justify-center h-64 w-80">
        <p className="text-muted-foreground">Opening setup...</p>
      </div>
    );
  }

  return <WalletShell key="wallet-shell" />;
}
