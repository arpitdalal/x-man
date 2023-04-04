import {
  createClient,
  type Provider,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";

export type TypedWindow = Window &
  typeof globalThis & {
    ENV: {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
    };
  };

const supabaseOptions: SupabaseClientOptions<string> = {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: { "x-application-name": "X Man" },
  },
};
const customWindow = window as TypedWindow;

export const supabaseClient = createClient(
  customWindow.ENV.SUPABASE_URL,
  customWindow.ENV.SUPABASE_ANON_KEY,
  supabaseOptions
);

export const continueWithProvider = async ({
  provider,
  redirectTo = "/app",
}: {
  provider: Provider;
  redirectTo?: string;
}) => {
  const redirectUrl = `${window.location.origin}/api/auth/callback?redirectTo=${redirectTo}`;

  return await supabaseClient.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });
};
