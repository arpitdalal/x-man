import type { Provider } from "@supabase/gotrue-js";
import type { Database } from "~/types/supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Income = Database["public"]["Tables"]["income"]["Row"];
export type Providers = Extract<Provider, "google" | "facebook">;

export type Error =
  | { error?: string; errorStatus: number }
  | {
      error?: never;
      errorStatus?: never;
    };
