import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { safeRedirect, unauthorized } from "remix-utils";
import authenticated, {
  authCookie,
  getExpenseById,
  getIncomeById,
  updateExpense,
  updateIncome,
} from "~/lib/supabase.server";
import TextInput from "~/components/TextInput";
import * as Switch from "@radix-ui/react-switch";
import * as Dialog from "@radix-ui/react-dialog";
import useRedirectTo from "~/hooks/useRedirectTo";
import Button from "~/components/Button";
import MyLinkBtn from "~/components/MyLinkBtn";
import type { Income } from "~/types";

export async function loader({ request, params }: LoaderArgs) {
  const redirectTo = new URL(request.url).searchParams.get("redirectTo");

  const authSession = await authCookie.getSession(
    request.headers.get("Cookie")
  );
  const userId = authSession.get("user_id");
  if (!userId || typeof userId !== "string") {
    throw unauthorized({
      message: "You must be logged in to access this page",
      data: null,
    });
  }

  const id = params.id;
  const isIncome = new URL(request.url).searchParams.get("isIncome");

  if (!id || isIncome === null) {
    throw redirect(safeRedirect(redirectTo, "/app"));
  }

  if (isIncome === "false") {
    const { expense, error } = await getExpenseById({ expenseId: id, userId });
    if (!expense || error) {
      return json({ message: "Not found.", data: null, isIncome }, 404);
    }

    return json({
      data: JSON.stringify(expense),
      message: "",
      isIncome,
    });
  }

  const { income, error } = await getIncomeById({ incomeId: id, userId });
  if (!income || error) {
    return json({ message: "Not found.", data: null, isIncome }, 404);
  }

  return json({
    data: JSON.stringify(income),
    message: "",
    isIncome,
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
      const id = params.id;
      const isIncome = new URL(request.url).searchParams.get("isIncome");

      if (!id || isIncome === null) {
        return redirect("/app");
      }

      const form = await request.formData();

      const title = form.get("title");
      const amount = form.get("amount");
      const addInTenPer = form.get("addInTenPer") ? true : false;
      const redirectTo = form.get("redirectTo") || "/app";

      if (
        !title ||
        !amount ||
        typeof title !== "string" ||
        typeof amount !== "string" ||
        typeof redirectTo !== "string"
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

      if (isIncome === "false") {
        const { expense, error: updateError } = await updateExpense({
          expenseId: id,
          userId: user.id,
          query: {
            title,
            amount: String(amount),
            categories: null,
          },
        });

        if (!expense || updateError) {
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

        return redirect(safeRedirect(redirectTo, "/app"));
      }
      const { income, error: updateError } = await updateIncome({
        incomeId: id,
        userId: user.id,
        query: {
          title,
          amount: String(amount),
          categories: null,
          addInTenPer,
        },
      });

      if (!income || updateError) {
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
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const data = loaderData.data;
  const isIncome = loaderData.isIncome === "true" ? true : false;
  const redirectTo = useRedirectTo();

  if (!data) {
    return <div>Not found</div>;
  }

  const expenseOrIncome = JSON.parse(data) as unknown as Income;

  return (
    <div>
      <Dialog.Root defaultOpen modal>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-[rgba(0,0,0,0.2)] backdrop-blur data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-day-100 dark:bg-night-500 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]  focus:outline-none dark:shadow-[hsl(0_0%_0%_/_35%)_0px_10px_38px_-10px,_hsl(0_0%_0%_/_35%)_0px_10px_20px_-15px]">
            <Dialog.Title className="m-0 text-[17px] font-medium">
              Edit{" "}
              <span className="italic font-bold">{expenseOrIncome.title}</span>
            </Dialog.Title>
            <Dialog.Description className="text-night-300 mt-2 text-[15px] leading-normal">
              Edit{" "}
              <span className="italic font-bold">{expenseOrIncome.title}</span>{" "}
              and then click save.
            </Dialog.Description>
            <Form method="post" replace className="mt-5 flex flex-col gap-4">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <div className="flex flex-col gap-2">
                <TextInput
                  label="Title"
                  id="title"
                  type="text"
                  name="title"
                  defaultValue={
                    actionData?.fields?.title || expenseOrIncome.title
                  }
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
                  pattern="[0-9]*"
                  defaultValue={
                    actionData?.fields?.title || expenseOrIncome.amount
                  }
                  required
                />
              </div>
              {isIncome ? (
                <div className="flex flex-row gap-2 items-center">
                  <label htmlFor="addInTenPer">
                    Add this income in 10% counting
                  </label>
                  <Switch.Root
                    className="w-[42px] h-[25px] bg-blackA9 rounded-full relative shadow-[0_2px_10px] shadow-blackA7 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-accent-purple outline-none cursor-default"
                    id="addInTenPer"
                    name="addInTenPer"
                    defaultChecked={
                      actionData?.fields?.addInTenPer !== undefined
                        ? actionData?.fields?.addInTenPer
                        : expenseOrIncome.addInTenPer
                    }
                  >
                    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA7 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                  </Switch.Root>
                </div>
              ) : null}
              <div className="mt-3 flex gap-2">
                <Button type="submit">Edit</Button>
                <MyLinkBtn
                  btnType="outline"
                  to={redirectTo || "/app"}
                  type="submit"
                >
                  Cancel
                </MyLinkBtn>
              </div>
            </Form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
