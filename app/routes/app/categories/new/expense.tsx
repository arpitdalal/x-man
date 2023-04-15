import { type ActionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { safeRedirect, unauthorized } from "remix-utils";
import Button from "~/components/Button";
import { DialogFooter } from "~/components/Dialog";
import MyLinkBtn from "~/components/MyLinkBtn";
import TextInput from "~/components/TextInput";
import useRedirectTo from "~/hooks/useRedirectTo";
import authenticated, { insertCategory } from "~/lib/supabase.server";

type ActionData = {
  formError?: string;
  fields?: {
    title?: string;
  };
};
export async function action({ request }: ActionArgs) {
  return await authenticated(
    request,
    async (user) => {
      const form = await request.formData();
      const title = form.get("title");

      if (!title || typeof title !== "string") {
        return json<ActionData>(
          {
            formError: `Form not submitted correctly.`,
            fields: {
              title: String(title) ?? "",
            },
          },
          403
        );
      }

      const { success, error } = await insertCategory({
        userId: user.id,
        category: {
          name: title,
          expense: true,
        },
      });

      if (!success && error) {
        return json<ActionData>(
          {
            formError: `Something went wrong.`,
            fields: {
              title: String(title) ?? "",
            },
          },
          500
        );
      }

      return redirect(
        safeRedirect(form.get("redirectTo") || "/app/categories")
      );
    },
    () => {
      throw unauthorized({ message: "You must be logged in." });
    }
  );
}

export default function Add() {
  const redirectTo = useRedirectTo() || "/app/categories";
  const actionData = useActionData();

  return (
    <Form method="post" replace className="mt-3 flex flex-col gap-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="flex flex-col gap-2">
        <TextInput
          label="Title"
          id="title"
          type="text"
          name="title"
          defaultValue={actionData?.fields?.title || ""}
          placeholder="Stocks"
          required
        />
      </div>
      <DialogFooter>
        <div className="mt-3 flex gap-2">
          <Button type="submit">Add</Button>
          <MyLinkBtn
            btnType="outline"
            to={redirectTo || "/app/categories"}
            type="submit"
          >
            Cancel
          </MyLinkBtn>
        </div>
      </DialogFooter>
    </Form>
  );
}
