import { json, type LoaderArgs, type MetaFunction } from "@remix-run/node";
import { Form, Link, Outlet, useCatch, useLoaderData } from "@remix-run/react";
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

      return json<AppLoaderData>({ profile });
    },
    () => {
      throw unauthorized({ message: "You must be logged in" });
    }
  );
}

export default function App() {
  const { profile } = useLoaderData<AppLoaderData>();

  if (!profile) {
    return <LoginMessage />;
  }

  return (
    <div className="h-screen flex flex-col">
      <Header profile={profile} />
      <div className="flex-1">
        <div className="px-5 lg:px-20 h-full">
          <div className="py-5 max-w-8xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return <LoginMessage />;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: Error }) {
  if (error.message === "Profile not found") {
    return <LoginMessage />;
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
    <header className="pt-3">
      <div className="px-5 lg:px-20">
        <div className="max-w-8xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-4xl sm:text-5xl">
            X Man
          </Link>
          <Form method="post" action="/api/logout">
            <Button
              type="submit"
              className="flex gap-3 justify-between items-center"
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
      </div>
      <div className="mt-4 px-5 lg:px-20 bg-day-200 dark:bg-night-500">
        <div className="max-w-8xl mx-auto flex gap-3">
          <MyNavLink to="dashboard">Dashboard</MyNavLink>
          <MyNavLink to="categories">Categories</MyNavLink>
          <MyNavLink to="presets">Presets</MyNavLink>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { mode, setMode } = useContext(ThemeContext);

  return (
    <footer className="py-3 px-5 lg:px-20 border-t border-night-400 dark:border-night-300 border-opacity-20">
      <div className="max-w-8xl mx-auto flex justify-between items-center">
        <p className="text-2xl font-bold">X Man</p>
        <div>
          <ThemeSwitcher mode={mode} setMode={setMode} />
        </div>
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
        className="bg-day-100 text-night-700 dark:bg-night-700 dark:text-day-100 rounded-lg"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
