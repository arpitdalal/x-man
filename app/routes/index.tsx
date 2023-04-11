import MyLinkBtn from "~/components/MyLinkBtn";
import { json, type LoaderArgs } from "@remix-run/node";
import authenticated, { getProfileById } from "~/lib/supabase.server";
import { useLoaderData } from "@remix-run/react";
import type { Profile } from "~/types";
import type { User } from "@supabase/supabase-js";

type LoaderData = {
  profile?: Profile;
  user?: User;
};
export async function loader({ request }: LoaderArgs) {
  return await authenticated(
    request,
    async (user) => {
      const { profile, error } = await getProfileById(user.id);
      if (error || !profile) {
        return json<LoaderData>({ user });
      }
      return json<LoaderData>({ user, profile });
    },
    () => {
      return json<LoaderData>({});
    }
  );
}

export default function Index() {
  const { user, profile } = useLoaderData<LoaderData>();

  return (
    <div className="flex h-screen flex-col items-center justify-center px-5 lg:px-20">
      <div className="mx-auto max-w-8xl text-center">
        <h1 className="text-5xl">X Man</h1>
        <p className="mt-3 max-w-3xl text-2xl">
          Your personalized e<span className="text-accent-purple">X</span>pense{" "}
          <span className="text-accent-purple">MAN</span>ager
        </p>
        <div className="mt-8 flex justify-center gap-8">
          {user ? (
            profile ? (
              <MyLinkBtn
                to="app/dashboard"
                size="lg"
                className="flex items-center justify-between gap-3"
              >
                <img
                  src={profile.avatar_url || ""}
                  alt={profile.name || profile.email}
                  className="h-8 w-8 rounded-full"
                />
                Dashboard
              </MyLinkBtn>
            ) : (
              <MyLinkBtn to="app/dashboard" size="lg">
                Dashboard
              </MyLinkBtn>
            )
          ) : (
            <>
              <MyLinkBtn to="register" size="lg">
                Register
              </MyLinkBtn>
              <MyLinkBtn to="login" size="lg">
                Login
              </MyLinkBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
