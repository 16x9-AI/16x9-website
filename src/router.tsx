import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { readCspNonce } from "@/lib/security-headers";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();
  const nonce = readCspNonce();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ssr: nonce ? { nonce } : undefined,
  });

  return router;
};
