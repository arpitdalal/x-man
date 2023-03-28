import * as Dialog from "@radix-ui/react-dialog";
import { Form, useActionData } from "@remix-run/react";
import TextInput from "~/components/TextInput";
import useRedirectTo from "~/hooks/useRedirectTo";
import { type ActionArgs, json, redirect } from "@remix-run/node";
import authenticated, {
  insertExpense,
  insertIncome,
} from "~/lib/supabase.server";
import { safeRedirect, unauthorized } from "remix-utils";
import Button from "~/components/Button";
import * as Switch from "@radix-ui/react-switch";
import { useContext, useState } from "react";
import { DateContext } from "~/utils/client/DateContext";
import MyLinkBtn from "~/components/MyLinkBtn";

type ActionData = {
  formError?: string;
  fields?: {
    title?: string;
    amount?: string;
    categories?: string;
    isExpense?: boolean;
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
      const isExpense = form.get("isExpense") ? true : false;
      const addInTenPer = form.get("addInTenPer") ? true : false;
      const date = form.get("date") || new Date().getDate().toString();
      const redirectTo = form.get("redirectTo") || "/app";

      if (
        !title ||
        !amount ||
        typeof title !== "string" ||
        typeof amount !== "string" ||
        typeof redirectTo !== "string" ||
        typeof date !== "string"
      ) {
        return json<ActionData>(
          {
            formError: `Form not submitted correctly.`,
            fields: {
              title: String(title) ?? "",
              amount: String(amount) ?? "",
              isExpense,
              addInTenPer,
            },
          },
          403
        );
      }

      if (isExpense) {
        const { expense, error: insertError } = await insertExpense({
          userId: user.id,
          expense: {
            title,
            amount: String(amount),
            day: String(date),
            month: String(month),
            year: String(year),
            categories: null,
          },
        });

        if (!expense || insertError) {
          return json<ActionData>(
            {
              formError: `Form not submitted correctly.`,
              fields: {
                title: String(title) ?? "",
                amount: String(amount) ?? "",
                isExpense,
                addInTenPer,
              },
            },
            403
          );
        }

        return redirect(safeRedirect(`${redirectTo}/${expense.id}`, "/app"));
      }
      const { income, error: insertError } = await insertIncome({
        userId: user.id,
        income: {
          title,
          amount: String(amount),
          day: String(date),
          month: String(month),
          year: String(year),
          categories: null,
          addInTenPer,
        },
      });

      if (!income || insertError) {
        return json<ActionData>(
          {
            formError: `Form not submitted correctly.`,
            fields: {
              title: String(title) ?? "",
              amount: String(amount) ?? "",
              isExpense,
              addInTenPer,
            },
          },
          403
        );
      }

      return redirect(safeRedirect(`${redirectTo}/${income.id}`, "/app"));
    },
    () => {
      throw unauthorized({ message: "You must be logged in." });
    }
  );
}

export default function New() {
  const actionData = useActionData<ActionData>();
  const [isExpense, setIsExpense] = useState(
    actionData?.fields?.isExpense !== undefined
      ? actionData?.fields?.isExpense
      : false
  );
  const redirectTo = useRedirectTo();
  const { date } = useContext(DateContext);

  return (
    <Dialog.Root defaultOpen modal>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-[rgba(0,0,0,0.2)] backdrop-blur data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-day-100 dark:bg-night-500 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]  focus:outline-none dark:shadow-[hsl(0_0%_0%_/_35%)_0px_10px_38px_-10px,_hsl(0_0%_0%_/_35%)_0px_10px_20px_-15px]">
          <Dialog.Title className="m-0 text-[17px] font-medium">
            Add Expense or Income
          </Dialog.Title>
          <Dialog.Description className="text-night-300 mt-2 text-[15px] leading-normal">
            Add an expense or an income and then click add.
          </Dialog.Description>
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
                defaultValue={actionData?.fields?.title || ""}
                required
              />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label htmlFor="isExpense">Turn on if this is an expense</label>
              <Switch.Root
                className="w-[42px] h-[25px] bg-blackA9 rounded-full relative shadow-[0_2px_10px] shadow-blackA7 focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-accent-purple outline-none cursor-default"
                id="isExpense"
                name="isExpense"
                checked={isExpense}
                onCheckedChange={setIsExpense}
              >
                <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA7 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
              </Switch.Root>
            </div>
            {!isExpense ? (
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
                      : true
                  }
                >
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-[0_2px_2px] shadow-blackA7 transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                </Switch.Root>
              </div>
            ) : null}
            <div className="mt-3 flex gap-2">
              <Button type="submit">Add</Button>
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
  );
}
