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
import { HelpCircle } from "lucide-react";
import MyTooltip from "~/components/MyTooltip";

export const meta: MetaFunction = () => {
  return {
    title: "Add income | X Man",
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
    seva?: boolean;
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
      const seva = form.get("seva") ? true : false;
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
              seva,
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
          seva,
        },
      });

      if (!income || insertError) {
        return json<ActionData>(
          {
            formError: `Form not submitted correctly.`,
            fields: {
              title,
              amount,
              seva,
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
    <Dialog open modal>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Income</DialogTitle>
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
            <label htmlFor="seva">Seva</label>
            <MyTooltip title="Include this income in 10% seva">
              <button type="button">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Include this income in 10% seva</span>
              </button>
            </MyTooltip>
            <Switch.Root
              className="relative h-[25px] w-[42px] cursor-default rounded-full bg-blackA9 shadow-[0_2px_10px] shadow-blackA7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black radix-state-checked:bg-accent-purple"
              id="seva"
              name="seva"
              defaultChecked={
                actionData?.fields?.seva !== undefined
                  ? actionData?.fields?.seva
                  : true
              }
            >
              <Switch.Thumb className="block h-[21px] w-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA7 transition-transform will-change-transform duration-100 radix-state-checked:translate-x-[19px]" />
            </Switch.Root>
          </div>
          <MyMultiSelect
            categories={incomeCategoryNames}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            label="Categories"
            required
          />
          <DialogFooter>
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
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
