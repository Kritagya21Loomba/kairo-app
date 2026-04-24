import { supabase } from "./supabase";
import type { KairoState } from "@/types";

const TABLE = "kairo_states";

/** Load state from Supabase by session key (username). Returns null if not found or on error. */
export async function loadStateFromSupabase(
  sessionKey: string
): Promise<KairoState | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("state")
      .eq("session_key", sessionKey)
      .single();

    if (error || !data) return null;
    return data.state as KairoState;
  } catch {
    return null;
  }
}

/** Save (upsert) full state to Supabase. Silently fails if offline or unconfigured. */
export async function saveStateToSupabase(
  sessionKey: string,
  state: KairoState
): Promise<void> {
  // Guard: skip if Supabase is not configured (placeholder values)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!url || url.includes("your-supabase-project-url")) return;

  try {
    await supabase.from(TABLE).upsert(
      { session_key: sessionKey, state },
      { onConflict: "session_key" }
    );
  } catch {
    // Silently swallow — localStorage is the source of truth
  }
}
