import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { promiseHash, safeRedirect, unauthorized } from "remix-utils";
import authenticated, {
  authCookie,
  getAllExpenseCategories,
  getExpenseById,
  updateExpense,
} from "~/lib/supabase.server";
import TextInput from "~/components/TextInput";
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
import type { Category, Expense } from "~/types";
import MyMultiSelect from "~/components/MyMultiSelect";
import { getOptionsFromArray, getStringFromOptions } from "~/utils/client";
import type {
  Option,
  SelectValue,
} from "react-tailwindcss-select/dist/components/type";
import { useState } from "react";
import ModalMessage from "~/components/ModalMessage";

export const meta: MetaFunction = ({ data }) => {
  if (!data?.expense)
    return {
      title: "Not found | X Man",
    };
  return {
    title: `Edit ${(data as unknown as LoaderData).expense.title} | X Man`,
  };
};

type LoaderData = {
  message: string;
  categories: Array<Category>;
  expense: Expense;
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
    expense: { expense, error },
    categories: { expenseCategories },
  } = await promiseHash({
    expense: getExpenseById({ expenseId: id, userId }),
    categories: getAllExpenseCategories({ userId }),
  });
  // const { expense, error } = await getExpenseById({ expenseId: id, userId });
  if (!expense || error) {
    return json(
      {
        message: "Not found.",
        expense: null,
        categories: [],
      },
      404
    );
  }

  return json({
    expense,
    message: "",
    categories: expenseCategories || [],
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
      const id = params.id;

      if (!id) {
        return redirect("/app");
      }

      const form = await request.formData();

      const title = form.get("title");
      const amount = form.get("amount");
      const categories = form.get("categories");
      const redirectTo = form.get("redirectTo") || "/app";

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
            },
          },
          403
        );
      }

      const { expense, error: updateError } = await updateExpense({
        expenseId: id,
        userId: user.id,
        query: {
          title,
          amount,
          categories,
        },
      });

      if (!expense || updateError) {
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
      throw unauthorized({
        message: "You must be logged in to access this page",
      });
    }
  );
}

export default function Edit() {
  const { expense, categories } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const redirectTo = useRedirectTo();
  const initialCategoriesArray = getOptionsFromArray(
    expense.categories?.split(",") || []
  );
  const [selectedCategories, setSelectedCategories] = useState<SelectValue>(
    initialCategoriesArray.length >= 0 ? initialCategoriesArray : []
  );
  const [title, setTitle] = useState<string>(
    actionData?.fields?.title || expense?.title || ""
  );
  const [amount, setAmount] = useState<string>(
    actionData?.fields?.amount || expense?.amount || ""
  );

  if (!expense) {
    return (
      <ModalMessage
        title="Not found"
        message="We couldn't find an expense. Please head back to the dashboard."
      />
    );
  }

  const categoryNames =
    categories?.map((category) => {
      return category.name || "";
    }) || [];

  const shouldSubmitBtnBeDisabled =
    title === expense.title &&
    amount === expense.amount &&
    getStringFromOptions(selectedCategories as unknown as Array<Option>) ===
      getStringFromOptions(initialCategoriesArray);

  return (
    <div>
      <Dialog open modal>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              Edit <span className="font-bold italic">{expense.title}</span>
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Edit <span className="font-bold italic">{expense.title}</span> and
            then click save
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
                  to={redirectTo || "/app"}
                  type="submit"
                >
                  Cancel
                </MyLinkBtn>
              </div>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
