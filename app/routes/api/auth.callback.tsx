import { useEffect } from "react";

import { supabaseClient } from "~/lib/supabase.client";
import { authCookie, setAuthSession } from "~/lib/supabase.server";

import { type ActionFunction, redirect } from "@remix-run/node";
import { useFetcher, useSearchParams } from "@remix-run/react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { safeRedirect } from "remix-utils";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const formDataSession = formData.get("session") as string | null;
  const event = formData.get("event") as AuthChangeEvent | null;
  const redirectTo = String(formData.get("redirectTo")) || "/app";
  if (!formDataSession || !event) {
    return redirect("/login");
  }
  const SupabaseSession: Session = JSON.parse(formDataSession);

  let session = await authCookie.getSession(request.headers.get("Cookie"));
  const { access_token: accessToken, refresh_token: refreshToken } =
    SupabaseSession;

  session = setAuthSession(session, accessToken, refreshToken || "");

  if (event === "SIGNED_IN") {
    return redirect(safeRedirect(redirectTo, "/app"), {
      headers: {
        "Set-Cookie": await authCookie.commitSession(session, {
          expires: new Date(Date.now() + 3600),
        }),
      },
    });
  } else if (event === "PASSWORD_RECOVERY") {
    return redirect("/change-password", {
      headers: {
        "Set-Cookie": await authCookie.commitSession(session, {
          expires: new Date(Date.now() + 3600),
        }),
      },
    });
  }
  redirect("/login");
};

export default function AuthCallback() {
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        const formData = new FormData();
        formData.append("session", JSON.stringify(session));
        formData.append("event", event);
        formData.append("redirectTo", searchParams.get("redirectTo") || "/app");

        fetcher.submit(formData, { method: "post" });
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetcher, searchParams]);

  return null;
}
