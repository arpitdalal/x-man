import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  promiseHash,
  safeRedirect,
  unauthorized,
  useHydrated,
} from "remix-utils";
import authenticated, {
  authCookie,
  getAllIncomeCategories,
  getIncomeById,
  updateIncome,
} from "~/lib/supabase.server";
import TextInput from "~/components/TextInput";
import * as Switch from "@radix-ui/react-switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/Dialog";
import useRedirectTo from "~/hooks/useRedirectTo";
import Button from "~/components/Button";
import MyLinkBtn from "~/components/MyLinkBtn";
import type { Category, Income } from "~/types";
import MyMultiSelect from "~/components/MyMultiSelect";
import { getOptionsFromArray, getStringFromOptions } from "~/utils/client";
import type {
  Option,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import { useState } from "react";
import ModalMessage from "~/components/ModalMessage";
import { HelpCircle } from "lucide-react";
import MyTooltip from "~/components/MyTooltip";
import PageOverlayCenter from "~/components/PageOverlayCenter";

export const meta: MetaFunction = ({ data }) => {
  if (!data?.income)
    return {
      title: "Not found | X Man",
    };
  return {
    title: `Edit ${(data as unknown as LoaderData).income.title} | X Man`,
  };
};

type LoaderData = {
  message: string;
  categories: Array<Category>;
  income: Income;
};
export async function loader({ request, params }: LoaderArgs) {
  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  const authSession = await authCookie.getSession(
    request.headers.get("Cookie")
  );
  const userId = authSession.get("user_id");
  if (!userId || typeof userId !== "string") {
    throw unauthorized({
      message: "You must be logged in to access this page",
    });
  }

  const id = params.id;

  if (!id) {
    throw redirect(safeRedirect(redirectTo, "/app"));
  }

  const {
    income: { income, error },
    categories: { incomeCategories },
  } = await promiseHash({
    income: getIncomeById({ incomeId: id, userId }),
    categories: getAllIncomeCategories({ userId }),
  });
  // const { income, error } = await getIncomeById({ incomeId: id, userId });
  if (!income || error) {
    return json(
      {
        message: "Not found.",
        income: null,
        categories: [],
      },
      404
    );
  }

  return json({
    income,
    message: "",
    categories: incomeCategories,
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
      const id = params.id;

      if (!id) {
        return redirect("/app");
      }

      const form = await request.formData();

      const title = form.get("title");
      const amount = form.get("amount");
      const categories = form.get("categories");
      const seva = form.get("seva") ? true : false;
      const redirectTo = form.get("redirectTo") || "/app/dashboard";

      if (
        !title ||
        !amount ||
        typeof title !== "string" ||
        typeof amount !== "string" ||
        typeof categories !== "string" ||
        typeof redirectTo !== "string"
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

      const { income, error: updateError } = await updateIncome({
        incomeId: id,
        userId: user.id,
        query: {
          title,
          amount,
          categories,
          seva,
        },
      });

      if (!income || updateError) {
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
      throw unauthorized({
        message: "You must be logged in to access this page",
      });
    }
  );
}

export default function Edit() {
  const { income, categories } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const redirectTo = useRedirectTo() || "/app/dashboard";
  const initialCategoriesArray = getOptionsFromArray(
    income.categories?.split(",") || []
  );
  const [selectedCategories, setSelectedCategories] = useState<SelectValue>(
    initialCategoriesArray.length >= 0 ? initialCategoriesArray : null
  );
  const [title, setTitle] = useState(actionData?.fields?.title || income.title);
  const [amount, setAmount] = useState(
    actionData?.fields?.amount || income.amount
  );
  const [isInTenPer, setIsInTenPer] = useState<boolean>(
    actionData?.fields?.seva !== undefined
      ? actionData.fields.seva
      : income?.seva !== undefined
      ? income.seva
      : true
  );
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

  if (!income) {
    return (
      <ModalMessage
        title="Not found"
        message="We couldn't find an income. Please head back to the dashboard."
      />
    );
  }

  const categoryNames =
    categories?.map((category) => {
      return category.name || "";
    }) || [];

  const shouldSubmitBtnBeDisabled =
    title === income.title &&
    amount === income.amount &&
    isInTenPer === income.seva &&
    getStringFromOptions(selectedCategories as unknown as Array<Option>) ===
      getStringFromOptions(initialCategoriesArray);

  return (
    <Dialog open modal>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            Edit <span className="font-bold italic">{income.title}</span>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Edit <span className="font-bold italic">{income.title}</span> and then
          click save
        </DialogDescription>
        <Form method="post" replace className="flex flex-col gap-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="flex flex-col gap-2">
            <TextInput
              label="Title"
              id="title"
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              className="relative h-6 w-11 rounded-full bg-blackA9 shadow-[0_2px_10px] shadow-blackA7 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black radix-state-checked:bg-accent-purple"
              id="seva"
              name="seva"
              checked={isInTenPer}
              onCheckedChange={setIsInTenPer}
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA7 transition-transform will-change-transform duration-100 radix-state-checked:translate-x-5" />
            </Switch.Root>
          </div>
          <MyMultiSelect
            categories={categoryNames}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            label="Categories"
            required
          />
          <DialogFooter>
            <div className="mt-3 flex gap-2">
              <Button type="submit" disabled={shouldSubmitBtnBeDisabled}>
                Edit
              </Button>
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
