"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type LoadingPhase = "loading" | "exiting" | "done";

interface LoadingContextType {
  loadingPhase: LoadingPhase;
  setLoadingPhase: (phase: LoadingPhase) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  loadingPhase: "done", // Default to done for SSR
  setLoadingPhase: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("loading");

  return (
    <LoadingContext.Provider value={{ loadingPhase, setLoadingPhase }}>
      {children}
    </LoadingContext.Provider>
  );
}
