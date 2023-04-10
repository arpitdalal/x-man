import { useSWEffect } from "~/utils/client/sw-hook";
import { json, type LinksFunction, type MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import styles from "./tailwind.css";
import { ThemeContext } from "~/utils/client/ThemeContext";
import nProgressCss from "./nprogress.css";
import { useLoadingEffect } from "~/hooks/useLoadingEffect";
import { cn } from "~/utils/client";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Home | X Man",
  viewport: "width=device-width,initial-scale=1",
  "color-scheme": "dark light",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: nProgressCss },
];

export type Mode = "system" | "light" | "dark";
export type ThemeContextType = [
  Mode,
  React.Dispatch<React.SetStateAction<Mode>>
];

export function loader() {
  return json({
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
  });
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>();
  const [mode, setMode] = useState<Mode>("system");
  const theme = mode === "dark" ? "dark" : "";
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.matches) {
      setMode("dark");
    }
    mq.addEventListener("change", (evt) =>
      setMode(evt.matches ? "dark" : "light")
    );
  }, []);
  useSWEffect();
  useLoadingEffect();

  return (
    <html lang="en" className={cn("overscroll-none", theme)}>
      <head>
        <Meta />
        <link rel="manifest" href="/resources/manifest.json" />
        <Links />
      </head>
      <body className="overscroll-none bg-day-100 text-night-700 dark:bg-night-700 dark:text-day-200">
        <main>
          <ThemeContext.Provider value={{ mode, setMode }}>
            <Outlet />
          </ThemeContext.Provider>
        </main>
        <ScrollRestoration getKey={(location) => location.pathname} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(loaderData.ENV)}`,
          }}
        />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
