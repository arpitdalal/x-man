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
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_14_Pro_Max_landscape.png",
    media:
      "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_14_Pro_landscape.png",
    media:
      "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png",
    media:
      "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png",
    media:
      "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png",
    media:
      "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png",
    media:
      "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_11__iPhone_XR_landscape.png",
    media:
      "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_landscape.png",
    media:
      "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_landscape.png",
    media:
      "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png",
    media:
      "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/12.9__iPad_Pro_landscape.png",
    media:
      "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/11__iPad_Pro__10.5__iPad_Pro_landscape.png",
    media:
      "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/10.9__iPad_Air_landscape.png",
    media:
      "screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/10.5__iPad_Air_landscape.png",
    media:
      "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/10.2__iPad_landscape.png",
    media:
      "screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_landscape.png",
    media:
      "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/8.3__iPad_Mini_landscape.png",
    media:
      "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_14_Pro_Max_portrait.png",
    media:
      "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_14_Pro_portrait.png",
    media:
      "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png",
    media:
      "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png",
    media:
      "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png",
    media:
      "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png",
    media:
      "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_11__iPhone_XR_portrait.png",
    media:
      "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png",
    media:
      "screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png",
    media:
      "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png",
    media:
      "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/12.9__iPad_Pro_portrait.png",
    media:
      "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/11__iPad_Pro__10.5__iPad_Pro_portrait.png",
    media:
      "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/10.9__iPad_Air_portrait.png",
    media:
      "screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/10.2__iPad_portrait.png",
    media:
      "screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png",
    media:
      "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
  },
  {
    rel: "apple-touch-startup-image",
    href: "/splash-screens/8.3__iPad_Mini_portrait.png",
    media:
      "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
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
