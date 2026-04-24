"use client";
import { TweaksProvider } from "@/contexts/TweaksContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastContainer } from "@/components/ui/Toast";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TweaksProvider>
        {children}
        <ToastContainer />
      </TweaksProvider>
    </AuthProvider>
  );
}
