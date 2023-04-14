import { useSWEffect } from "~/utils/client/sw-hook";
import { json } from "@remix-run/node";
import type { LoaderArgs, LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import styles from "./tailwind.css";
import nProgressCss from "./nprogress.css";
import { useLoadingEffect } from "~/hooks/useLoadingEffect";
import { cn } from "~/utils/client";
import {
  NonFlashOfWrongThemeEls,
  ThemeProvider,
  useTheme,
} from "~/utils/client/theme-provider";
import { getThemeSession } from "~/utils/server/theme.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Home | X Man",
  viewport: "width=device-width,viewport-fit=cover,initial-scale=1",
  "apple-mobile-web-app-capable": "yes",
  "apple-mobile-web-app-status-bar-style": "default",
  "msapplication-TileColor": "#6A44FF",
});

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: nProgressCss },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/icons/apple-icon.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/icons/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/icons/favicon-16x16.png",
  },
  {
    rel: "manifest",
    href: "/resources/manifest.json",
  },
  {
    rel: "mask-icon",
    href: "/icons/safari-pinned-tab.svg",
    color: "#6a44ff",
  },
];

export async function loader({ request }: LoaderArgs) {
  return json({
    ENV: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
    theme: (await getThemeSession(request)).getTheme(),
  });
}

function App() {
  const loaderData = useLoaderData<typeof loader>();
  const [theme] = useTheme();
  useSWEffect();
  useLoadingEffect();

  return (
    <html lang="en" className={cn("overscroll-none", theme)}>
      <head>
        <Meta />
        <meta
          name="theme-color"
          content={theme === "dark" ? "#090909" : "#F7F5FF"}
        />
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(loaderData.theme)} />
      </head>
      <body className="custom-scrollbar overscroll-none bg-day-100 text-night-700 dark:bg-night-700 dark:text-day-200">
        <main>
          <Outlet />
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

export default function AppWithProviders() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <ThemeProvider specifiedTheme={loaderData.theme}>
      <App />
    </ThemeProvider>
  );
}
