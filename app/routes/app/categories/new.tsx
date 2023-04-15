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
import Tabs from "~/components/LinkTabs";
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
        <Tabs
          links={[
            { label: "Income", url: "income" },
            { label: "Expense", url: "expense" },
          ]}
        />
        {/* <div className="mt-4 w-[400px]">
          <div className="inline-flex items-center justify-center rounded-md bg-night-200 p-1 dark:bg-night-700">
            <NavLink
              to={`income${location.search}`}
              className={({ isActive }) => {
                return `inline-flex min-w-[100px] items-center justify-center rounded-[0.185rem] px-3 py-1.5  text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50${
                  isActive
                    ? " bg-white text-night-700 shadow-sm dark:bg-accent-purple dark:text-day-100"
                    : ""
                }`;
              }}
            >
              Income
            </NavLink>
            <NavLink
              to={`expense${location.search}`}
              className={({ isActive }) => {
                return `inline-flex min-w-[100px] items-center justify-center rounded-[0.185rem] px-3 py-1.5  text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50${
                  isActive
                    ? " bg-white text-night-700 shadow-sm dark:bg-accent-purple dark:text-day-100"
                    : ""
                }`;
              }}
            >
              Expense
            </NavLink>
          </div>
        </div> */}
        {/* <Tabs defaultValue="income" className="mt-4 w-[400px]">
          <TabsList>
            <Link to={`income${location.search}`}>
              <p>Income</p>
            </Link>
            <Link to={`expense${location.search}`}>
              <p>Expense</p>
            </Link>
          </TabsList>
          <TabsContent value="income">
            <Form method="post" replace className="flex flex-col gap-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="type" value="income" />
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
          </TabsContent>
          <TabsContent value="expense">
            <Form method="post" replace className="flex flex-col gap-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="type" value="expense" />
              <div className="flex flex-col gap-2">
                <TextInput
                  label="Title"
                  id="title"
                  type="text"
                  name="title"
                  defaultValue={actionData?.fields?.title || ""}
                  placeholder="Vacation"
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
          </TabsContent>
        </Tabs> */}
        <Outlet />
      </DialogContent>
    </Dialog>
  );
}
