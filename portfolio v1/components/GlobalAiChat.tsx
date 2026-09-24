"use client";

import { useLoading } from "@/contexts/LoadingContext";
import AiChat from "./AiChat";

// Wrapper global untuk AiChat — ditaruh di layout.tsx di luar MainContentWrapper
// Ini WAJIB agar position: fixed tidak rusak oleh animasi transform (slide-in) dari page
export default function GlobalAiChat() {
  const { loadingPhase } = useLoading();
  
  if (loadingPhase !== "done") return null;
  
  return <AiChat />;
}
