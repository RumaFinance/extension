import { useEffect } from "react";

export function useThemeMode(isPrivateMode: boolean) {
  useEffect(() => {
    // Reset all theme classes first
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.remove("dark-private");
    document.documentElement.classList.remove("light");
    document.documentElement.classList.remove("light-private");

    if (isPrivateMode) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark-private");
      } else {
        document.documentElement.classList.add("light-private");
      }
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.add("light");
      }
    }
  }, [isPrivateMode]);
}
