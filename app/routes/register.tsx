import {
  type ActionArgs,
  type LoaderArgs,
  redirect,
  json,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import Button from "~/components/Button";
import MyLink from "~/components/MyLink";
import TextInput from "~/components/TextInput";
import authenticated, { registerUser } from "~/lib/supabase.server";

export function meta() {
  return { title: "Register | X Man" };
}

export function loader({ request }: LoaderArgs) {
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
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return json(
      {
        formError: `Form not submitted correctly.`,
        fields: {
          email: String(email) ?? "",
        },
        result: "failure",
      },
      403
    );
  }

  const { user, error } = await registerUser({
    email,
    password,
  });
  if (error || !user) {
    return json(
      {
        formError: error || "Something went wrong",
        fields: { email },
        result: "failure",
      },
      401
    );
  }

  return json(
    { result: "success", formError: "", fields: { email: "" } },
    { status: 201 }
  );
}

export default function Register() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="h-safe-screen flex flex-col items-center justify-center px-5 lg:px-20">
      <div className="mx-auto max-w-8xl text-center">
        <h1 className="text-5xl">Join Now</h1>
        <Form
          replace
          method="post"
          className="mt-8 flex flex-col items-center gap-4"
        >
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
              minLength={10}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="mt-3">
            <Button type="submit">Register</Button>
          </div>
        </Form>
        <div className="mt-4 text-left">
          <p>
            Already have an account?{" "}
            <MyLink to="/login" className="underline hover:text-accent-purple">
              Login
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
