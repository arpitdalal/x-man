import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/Dialog";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import TextInput from "~/components/TextInput";
import useRedirectTo from "~/hooks/useRedirectTo";
import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import authenticated, {
  authCookie,
  getAllExpenseCategories,
  insertExpense,
} from "~/lib/supabase.server";
import { safeRedirect, unauthorized, useHydrated } from "remix-utils";
import Button from "~/components/Button";
import { useContext, useState } from "react";
import { DateContext } from "~/utils/client/DateContext";
import MyLinkBtn from "~/components/MyLinkBtn";
import MyMultiSelect from "~/components/MyMultiSelect";
import type { SelectValue } from "react-tailwindcss-select/dist/components/type";
import { sanitizeAmount } from "~/utils/server";
import PageOverlayCenter from "~/components/PageOverlayCenter";

export const meta: MetaFunction = () => {
  return {
    title: "Add expense | X Man",
  };
};

export async function loader({ request }: LoaderArgs) {
  const authSession = await authCookie.getSession(
    request.headers.get("Cookie")
  );
  const userId = authSession.get("user_id");
  if (!userId || typeof userId !== "string") {
    throw unauthorized({
      message: "You must be logged in to access this page",
    });
  }

  const { expenseCategories, error: expenseCategoriesError } =
    await getAllExpenseCategories({ userId });

  if (expenseCategoriesError && !expenseCategories) {
    return json({
      expenseCategories: [],
    });
  }

  return json({
    expenseCategories,
  });
}

type ActionData = {
  formError?: string;
  fields?: {
    title?: string;
    amount?: string;
    categories?: string;
  };
};
export async function action({ params, request }: ActionArgs) {
  return await authenticated(
    request,
    async (user) => {
      const year = params.year || new Date().getFullYear().toString();
      const month = params.month || (new Date().getMonth() + 1).toString();

      const form = await request.formData();

      const title = form.get("title");
      const amount = form.get("amount");
      const categories = form.get("categories");
      const date = form.get("date") || new Date().getDate().toString();
      const redirectTo = form.get("redirectTo") || "/app/dashboard";

      if (
        !title ||
        !amount ||
        typeof title !== "string" ||
        typeof amount !== "string" ||
        typeof categories !== "string" ||
        typeof redirectTo !== "string" ||
        typeof date !== "string"
      ) {
        return json<ActionData>(
          {
            formError: `Form not submitted correctly.`,
            fields: {
              title: String(title) ?? "",
              amount: String(amount) ?? "",
            },
          },
          403
        );
      }

      const { expense, error: insertError } = await insertExpense({
        userId: user.id,
        expense: {
          title,
          amount: sanitizeAmount(amount),
          day: date,
          month: month,
          year: year,
          categories,
        },
      });

      if (!expense || insertError) {
        return json<ActionData>(
          {
            formError: `Form not submitted correctly.`,
            fields: {
              title,
              amount,
            },
          },
          403
        );
      }

      return redirect(safeRedirect(redirectTo, "/app"));
    },
    () => {
      throw unauthorized({ message: "You must be logged in." });
    }
  );
}

export default function New() {
  const { expenseCategories } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const redirectTo = useRedirectTo() || "/app/dashboard";
  const { date } = useContext(DateContext);
  const [selectedCategories, setSelectedCategories] =
    useState<SelectValue>(null);
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

  const expenseCategoryNames =
    expenseCategories?.map((expenseCategory) => {
      return expenseCategory.name || "";
    }) || [];

  return (
    <Dialog open modal>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <Form method="post" replace className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input type="hidden" name="date" value={date} />
          <div className="flex flex-col gap-2">
            <TextInput
              label="Title"
              id="title"
              type="text"
              name="title"
              defaultValue={actionData?.fields?.title || ""}
              placeholder="Shopping"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <TextInput
              label="Amount"
              id="amount"
              type="text"
              name="amount"
              inputMode="decimal"
              pattern="[0-9.]*"
              defaultValue={actionData?.fields?.title || ""}
              placeholder="400.00"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <MyMultiSelect
              categories={expenseCategoryNames}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              label="Categories"
              required
            />
          </div>
          <DialogFooter>
            <div className="mt-3 flex gap-2">
              <Button type="submit">Add</Button>
              <MyLinkBtn
                btnType="outline"
                to={redirectTo || "/app/dashboard"}
                type="submit"
              >
                Cancel
              </MyLinkBtn>
            </div>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
