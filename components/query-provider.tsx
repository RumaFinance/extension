import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";

interface QueryProviderProperties {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProperties) => {
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          retryDelay: 1000,
          staleTime: Number.POSITIVE_INFINITY,
        },
        mutations: { retry: false, retryDelay: 1000 },
      },
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
