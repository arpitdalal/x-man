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
  getAllIncomeCategories,
  insertIncome,
} from "~/lib/supabase.server";
import { safeRedirect, unauthorized } from "remix-utils";
import Button from "~/components/Button";
import * as Switch from "@radix-ui/react-switch";
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

  const { incomeCategories, error: incomeCategoriesError } =
    await getAllIncomeCategories({ userId });

  if (incomeCategoriesError && !incomeCategories) {
    return json({
      incomeCategories: [],
    });
  }

  return json({
    incomeCategories,
  });
}

type ActionData = {
  formError?: string;
  fields?: {
    title?: string;
    amount?: string;
    categories?: string;
    addInTenPer?: boolean;
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
      const addInTenPer = form.get("addInTenPer") ? true : false;
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
              addInTenPer,
            },
          },
          403
        );
      }

      const { income, error: insertError } = await insertIncome({
        userId: user.id,
        income: {
          title,
          amount: sanitizeAmount(amount),
          day: date,
          month: month,
          year: year,
          categories,
          addInTenPer,
        },
      });

      if (!income || insertError) {
        return json<ActionData>(
          {
            formError: `Form not submitted correctly.`,
            fields: {
              title,
              amount,
              addInTenPer,
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
  const { incomeCategories } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const redirectTo = useRedirectTo();
  const { date } = useContext(DateContext);
  const [selectedCategories, setSelectedCategories] =
    useState<SelectValue>(null);

  const incomeCategoryNames =
    incomeCategories?.map((incomeCategory) => {
      return incomeCategory.name || "";
    }) || [];

  return (
    <Dialog.Root open defaultOpen modal>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-lg bg-day-100 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none  dark:bg-night-500 dark:shadow-[hsl(0_0%_0%_/_35%)_0px_10px_38px_-10px,_hsl(0_0%_0%_/_35%)_0px_10px_20px_-15px]">
          <Dialog.Title className="m-0 text-[17px] font-medium">
            Add Income
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
                placeholder="Salary"
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
                placeholder="1000.00"
                required
              />
            </div>
            <div className="flex flex-row items-center gap-2">
              <label htmlFor="addInTenPer">
                Add this income in 10% counting
              </label>
              <Switch.Root
                className="relative h-[25px] w-[42px] cursor-default rounded-full bg-blackA9 shadow-[0_2px_10px] shadow-blackA7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-accent-purple"
                id="addInTenPer"
                name="addInTenPer"
                defaultChecked={
                  actionData?.fields?.addInTenPer !== undefined
                    ? actionData?.fields?.addInTenPer
                    : true
                }
              >
                <Switch.Thumb className="block h-[21px] w-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA7 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
              </Switch.Root>
            </div>
            <MyMultiSelect
              categories={incomeCategoryNames}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              label="Categories"
              required
            />
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
