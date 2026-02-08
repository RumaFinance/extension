import { createRoot } from "react-dom/client";

import { WalletProvider } from "../contexts/wallet-context";
import { ThemeProvider } from "../components/theme-provider";
import { QueryProvider } from "../components/query-provider";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  console.error("Root container not found!");
} else {
  const root = createRoot(container);

  root.render(
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <WalletProvider>
          <App />
        </WalletProvider>
      </QueryProvider>
    </ThemeProvider>,
  );
}
