import * as Dialog from "@radix-ui/react-dialog";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import TextInput from "~/components/TextInput";
import useRedirectTo from "~/hooks/useRedirectTo";
import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
} from "@remix-run/node";
import authenticated, {
  authCookie,
  getAllExpenseCategories,
  insertExpense,
} from "~/lib/supabase.server";
import { safeRedirect, unauthorized } from "remix-utils";
import Button from "~/components/Button";
import { useContext, useState } from "react";
import { DateContext } from "~/utils/client/DateContext";
import MyLinkBtn from "~/components/MyLinkBtn";
import MyMultiSelect from "~/components/MyMultiSelect";
import type { SelectValue } from "react-tailwindcss-select/dist/components/type";
import { sanitizeAmount } from "~/utils/server";

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
      const redirectTo = form.get("redirectTo") || "/app";

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
  const redirectTo = useRedirectTo();
  const { date } = useContext(DateContext);
  const [selectedCategories, setSelectedCategories] =
    useState<SelectValue>(null);

  const expenseCategoryNames =
    expenseCategories?.map((expenseCategory) => {
      return expenseCategory.name || "";
    }) || [];

  return (
    <Dialog.Root open defaultOpen modal>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-lg bg-day-100 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none  dark:bg-night-500 dark:shadow-[hsl(0_0%_0%_/_35%)_0px_10px_38px_-10px,_hsl(0_0%_0%_/_35%)_0px_10px_20px_-15px]">
          <Dialog.Title className="m-0 text-[17px] font-medium">
            Add Expense
          </Dialog.Title>
          <Form method="post" replace className="mt-5 flex flex-col gap-4">
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
            <div className="mt-3 flex gap-2">
              <Button type="submit">Add</Button>
              <MyLinkBtn
                btnType="outline"
                to={redirectTo || "/app"}
                type="submit"
                className="border-b"
              >
                Cancel
              </MyLinkBtn>
            </div>
          </Form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
