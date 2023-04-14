import { createCookieSessionStorage } from "@remix-run/node";
import { isTheme, Theme } from "~/utils/client/theme-provider";

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: "XMAN:theme",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    secrets: [process.env.SESSION_SECRET],
    path: "/",
    sameSite: "lax",
  },
});

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get("Cookie"));
  return {
    getTheme: () => {
      const themeValue = session.get("theme");
      return isTheme(themeValue) ? themeValue : Theme.DARK;
    },
    setTheme: (theme: Theme) => session.set("theme", theme),
    commit: () =>
      // no theme for you on my 100th birthday! 😂
      themeStorage.commitSession(session, { expires: new Date("2099-03-21") }),
  };
}

export { getThemeSession };
