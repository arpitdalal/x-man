import { type ActionArgs, json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { safeRedirect, unauthorized, useHydrated } from "remix-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/Dialog";
import PageOverlayCenter from "~/components/PageOverlayCenter";
import LinkTabs from "~/components/LinkTabs";
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
      const type = form.get("type");

      if (
        !title ||
        !type ||
        typeof title !== "string" ||
        typeof type !== "string"
      ) {
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
          expense: type === "expense",
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
  const isHydrated = useHydrated();
  if (!isHydrated) {
    return (
      <PageOverlayCenter className="px-4">
        <div className="mx-auto max-w-4xl rounded-lg bg-day-100 p-8 text-center dark:bg-night-500">
          <h1 className="text-5xl">Something went wrong</h1>
          <p className="mt-3 text-2xl">
            Looks like Javascript didn't load. Either because of bad network or
            your browser has disabled Javascript. Please reload the page or try
            again later.
          </p>
        </div>
      </PageOverlayCenter>
    );
  }

  return (
    <Dialog open modal>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <LinkTabs
          links={[
            { label: "Income", url: "income" },
            { label: "Expense", url: "expense" },
          ]}
        />
        <Outlet />
      </DialogContent>
    </Dialog>
  );
}
