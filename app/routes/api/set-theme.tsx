import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { isTheme } from "~/utils/client/theme-provider";
import { getThemeSession } from "~/utils/server/theme.server";

export function loader() {
  return redirect("/", { status: 404 });
}

export async function action({ request }: ActionArgs) {
  const themeSession = await getThemeSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const theme = form.get("theme");
  if (!isTheme(theme)) {
    return json({
      success: false,
      message: `theme value of ${theme} is not a valid theme.`,
    });
  }

  themeSession.setTheme(theme);
  return json(
    { success: true },
    {
      headers: { "Set-Cookie": await themeSession.commit() },
    }
  );
}

export default function MarkRead() {
  return <div>Oops... You should not see this.</div>;
}
