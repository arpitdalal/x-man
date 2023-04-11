import {
  type LoaderArgs,
  type ActionArgs,
  redirect,
  json,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { safeRedirect } from "remix-utils";
import Button from "~/components/Button";
import MyLink from "~/components/MyLink";
import TextInput from "~/components/TextInput";
import useRedirectTo from "~/hooks/useRedirectTo";
import authenticated, {
  authCookie,
  loginUser,
  setAuthSession,
} from "~/lib/supabase.server";

export function meta() {
  return { title: "Login | X Man" };
}

export async function loader({ request }: LoaderArgs) {
  return authenticated(
    request,
    () => {
      return redirect("/app");
    },
    () => {
      return json({});
    }
  );
}

export async function action({ request }: ActionArgs) {
  let session = await authCookie.getSession(request.headers.get("Cookie"));

  const form = await request.formData();

  const email = form.get("email");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/app/dashboard";
  if (
    !email ||
    !password ||
    typeof redirectTo !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return json(
      {
        formError: `Form not submitted correctly.`,
        fields: {
          email: String(email) ?? "",
        },
      },
      403
    );
  }

  const { accessToken, refreshToken, userId, error } = await loginUser({
    email,
    password,
  });
  if (error || !accessToken || !refreshToken || !userId) {
    return json(
      { formError: error || "Something went wrong", fields: { email } },
      403
    );
  }

  const { session: newSession, error: newSessionError } = setAuthSession(
    session,
    accessToken,
    refreshToken,
    userId
  );
  if (!newSession || newSessionError) {
    return json({ formError: "Something went wrong", fields: { email } }, 500);
  }

  return redirect(safeRedirect(redirectTo, "/app"), {
    headers: {
      "Set-Cookie": await authCookie.commitSession(session, {
        expires: new Date(Date.now() + 3600),
      }),
    },
  });
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const redirectTo = useRedirectTo() || "/app/dashboard";

  return (
    <div className="flex h-screen flex-col items-center justify-center px-5 lg:px-20">
      <div className="mx-auto max-w-8xl text-center">
        <h1 className="text-5xl">Login</h1>
        <Form
          replace
          method="post"
          className="mt-8 flex flex-col items-center gap-4"
        >
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="flex flex-col items-start">
            <TextInput
              label="Email"
              id="email"
              type="email"
              name="email"
              defaultValue={actionData?.fields.email}
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col items-start">
            <TextInput
              label="Password"
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </div>
          <div className="mt-3">
            <Button type="submit">Login</Button>
          </div>
        </Form>
        <div className="mt-4 text-left">
          <p>
            Don't have an account?{" "}
            <MyLink
              to="/register"
              className="underline hover:text-accent-purple"
            >
              Register
            </MyLink>
          </p>
        </div>
        {actionData?.formError ? (
          <div className="mt-4 text-accent-red">
            <p>{actionData.formError}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
