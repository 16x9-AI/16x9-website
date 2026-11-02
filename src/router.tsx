import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // No React Query: nothing on the site ran a query, so the client and provider were dead weight
  // on every page load (removed in the PR #4 performance pass, 2026-11-02).
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
