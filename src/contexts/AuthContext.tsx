"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  needsOnboarding: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (username: string) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null, session: null, loading: true, needsOnboarding: false,
  signInWithGoogle: async () => { },
  signInWithDiscord: async () => { },
  signOut: async () => { },
  completeOnboarding: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const supabase = createClient();

  const checkOnboarding = (u: User | null) => {
    // Only show onboarding if user is fully loaded AND hasn't completed it
    if (!u) { setNeedsOnboarding(false); return; }
    setNeedsOnboarding(u.user_metadata?.onboarding_complete !== true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkOnboarding(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkOnboarding(session?.user ?? null);
      // Don't set loading false here — initial load already handled above
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/api/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  };

  const signInWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${siteUrl}/api/auth/callback` },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setNeedsOnboarding(false);
  };

  const completeOnboarding = (_username: string) => {
    setNeedsOnboarding(false);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, needsOnboarding, signInWithGoogle, signInWithDiscord, signOut, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);