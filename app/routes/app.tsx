import { json, type LoaderArgs, type MetaFunction } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useCatch,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { useContext, useState } from "react";
import { unauthorized } from "remix-utils";
import Button from "~/components/Button";
import FullPageCenter from "~/components/FullpageCenter";
import LoginMessage from "~/components/LoginMessage";
import MyLink from "~/components/MyLink";
import { ThemeContext } from "~/utils/client/ThemeContext";
import authenticated, { getProfileById } from "~/lib/supabase.server";
import type { Mode } from "~/root";
import type { Profile } from "~/types";
import MyNavLink from "~/components/MyNavLink";
import {
  LayoutDashboardIcon,
  LayoutGridIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import MobileNavLink from "~/components/MobileNavLink";

export const meta: MetaFunction = () => {
  return { title: "Dashboard | X Man" };
};

export type AppLoaderData = {
  profile?: Profile;
};
export async function loader({ request }: LoaderArgs) {
  return await authenticated(
    request,
    async (user) => {
      const { profile, error } = await getProfileById(user.id);
      if (error || !profile) {
        return json<AppLoaderData>({});
      }

      return json<AppLoaderData>({
        profile,
      });
    },
    () => {
      throw unauthorized({ message: "You must be logged in" });
    }
  );
}

export default function App() {
  const { profile } = useLoaderData<AppLoaderData>();
  const location = useLocation();

  if (!profile) {
    return <LoginMessage redirectUrl={location.pathname} />;
  }

  return (
    <div className="h-safe-screen flex flex-col">
      <Header profile={profile} />
      <div className="flex-1">
        <div className="sticky top-0 mt-4 hidden gap-3 bg-day-200 px-5 dark:bg-night-500 md:flex lg:px-20">
          <MyNavLink to="dashboard">Dashboard</MyNavLink>
          <MyNavLink to="categories">Categories</MyNavLink>
          <MyNavLink to="presets">Presets</MyNavLink>
        </div>
        <Outlet />
      </div>
      <Footer />
      <MobileBar />
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const location = useLocation();

  if (caught.status === 401) {
    return <LoginMessage redirectUrl={location.pathname} />;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: Error }) {
  const location = useLocation();

  if (error.message === "Profile not found") {
    return <LoginMessage redirectUrl={location.pathname} />;
  }

  console.error("Error message: ", error.message); // TODO: Log this nicely
  console.error("Error stack trace: ", error.stack); // TODO: Log this nicely

  return (
    <FullPageCenter
      title="Oops! Something went wrong"
      message={
        <>
          Please try to refresh this page or go back to the{" "}
          <MyLink to="/">home page</MyLink>
        </>
      }
    />
  );
}

function Header({ profile }: { profile: Profile }) {
  return (
    <>
      <header className="bg-day-100 pt-3 dark:bg-night-700">
        <div className="flex items-center justify-between px-5 lg:px-20">
          <Link to="/" className="text-4xl sm:text-5xl">
            X Man
          </Link>
          <Form method="post" action="/api/logout">
            <Button
              type="submit"
              className="flex items-center justify-between gap-3"
              size="sm"
            >
              <img
                src={profile.avatar_url || ""}
                alt={profile.name || profile.email}
                className="h-8 w-8 rounded-full"
              />
              <span>Logout</span>
            </Button>
          </Form>
        </div>
      </header>
    </>
  );
}

function MobileBar() {
  return (
    <div className="mobile-bottom-sticky-bar sticky bg-day-200 dark:bg-night-500 md:hidden">
      <div className="grid min-h-[48px] w-full grid-flow-col items-stretch gap-x-8">
        <MobileNavLink to="dashboard">
          {({ isActive }) => {
            if (isActive) {
              return (
                <>
                  <span
                    className="absolute inset-x-0 top-0 my-0 mx-auto h-0.5 w-24 bg-accent-purple"
                    aria-hidden="true"
                  />
                  <LayoutDashboardIcon className="mx-auto text-night-700 dark:text-day-100" />
                </>
              );
            } else {
              return (
                <LayoutDashboardIcon className="mx-auto text-dark-muted-600 dark:text-light-muted-500" />
              );
            }
          }}
        </MobileNavLink>
        <MobileNavLink to="categories">
          {({ isActive }) => {
            if (isActive) {
              return (
                <>
                  <span
                    className="absolute inset-x-0 top-0 my-0 mx-auto h-0.5 w-24 bg-accent-purple"
                    aria-hidden="true"
                  />
                  <LayoutGridIcon className="mx-auto text-night-700 dark:text-day-100" />
                </>
              );
            } else {
              return (
                <LayoutGridIcon className="mx-auto text-dark-muted-600 dark:text-light-muted-500" />
              );
            }
          }}
        </MobileNavLink>
        <MobileNavLink to="presets">
          {({ isActive }) => {
            if (isActive) {
              return (
                <>
                  <span
                    className="absolute inset-x-0 top-0 my-0 mx-auto h-0.5 w-24 bg-accent-purple"
                    aria-hidden="true"
                  />
                  <SlidersHorizontalIcon className="mx-auto text-night-700 dark:text-day-100" />
                </>
              );
            } else {
              return (
                <SlidersHorizontalIcon className="mx-auto text-dark-muted-600 dark:text-light-muted-500" />
              );
            }
          }}
        </MobileNavLink>
      </div>
    </div>
  );
}

function Footer() {
  const { mode, setMode } = useContext(ThemeContext);

  return (
    <footer className="flex items-center justify-between border-t border-night-400 border-opacity-20 py-3 px-5 dark:border-night-300 lg:px-20">
      <p className="text-2xl font-bold">X Man</p>
      <div>
        <ThemeSwitcher mode={mode} setMode={setMode} />
      </div>
    </footer>
  );
}

function ThemeSwitcher({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}) {
  const [selectedMode, setSelectedMode] = useState(mode);

  function handleClick(clickedMode: Mode) {
    switch (clickedMode) {
      case "light": {
        setMode("light");
        return;
      }
      case "dark": {
        setMode("dark");
        return;
      }
      default: {
        setMode("system");
        return;
      }
    }
  }

  return (
    <div className="flex gap-3">
      <select
        name="mode"
        id="mode"
        value={selectedMode}
        onChange={(e) => {
          const newMode = e.target.value as unknown as Mode;
          setSelectedMode(newMode);
          handleClick(newMode);
        }}
        className="custom-select"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
