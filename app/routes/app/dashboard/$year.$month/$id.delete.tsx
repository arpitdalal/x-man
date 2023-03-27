import {
  json,
  type LoaderArgs,
  redirect,
  type ActionArgs,
} from "@remix-run/node";
import { safeRedirect, unauthorized } from "remix-utils";
import authenticated, {
  authCookie,
  deleteExpense,
  deleteIncome,
  getExpenseById,
  getIncomeById,
} from "~/lib/supabase.server";
import { Form, useLoaderData } from "@remix-run/react";
import type { Income } from "~/types";
import * as Dialog from "@radix-ui/react-dialog";
import Button from "~/components/Button";
import MyLinkBtn from "~/components/MyLinkBtn";
import useRedirectTo from "~/hooks/useRedirectTo";

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
      return json({ message: "Not found.", data: null }, 404);
    }

    return json({
      data: JSON.stringify(expense),
      message: "",
    });
  }

  const { income, error } = await getIncomeById({ incomeId: id, userId });
  if (!income || error) {
    return json({ message: "Not found.", data: null }, 404);
  }

  return json({
    data: JSON.stringify(income),
    message: "",
  });
}

export async function action({ request, params }: ActionArgs) {
  return await authenticated(
    request,
    async (user) => {
      const redirectTo = new URL(request.url).searchParams.get("redirectTo");

      const userId = user.id;

      const id = params.id;
      const isIncome = new URL(request.url).searchParams.get("isIncome");

      if (!id || isIncome === null) {
        throw redirect(safeRedirect(redirectTo, "/app"));
      }

      if (isIncome === "false") {
        await deleteExpense({ expenseId: id, userId });
        return redirect(safeRedirect(redirectTo, "/app"));
      }

      await deleteIncome({ incomeId: id, userId });
      return redirect(safeRedirect(redirectTo, "/app"));
    },
    () => {
      throw unauthorized({
        message: "You must be logged in to access this page",
      });
    }
  );
}

export default function Delete() {
  const { data } = useLoaderData<typeof loader>();
  const redirectTo = useRedirectTo();

  if (!data) {
    return <div>Not found</div>;
  }

  const expenseOrIncome = JSON.parse(data) as unknown as Income;

  return (
    <Dialog.Root defaultOpen modal>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-[rgba(0,0,0,0.2)] backdrop-blur data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-day-100 dark:bg-night-500 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]  focus:outline-none dark:shadow-[hsl(0_0%_0%_/_35%)_0px_10px_38px_-10px,_hsl(0_0%_0%_/_35%)_0px_10px_20px_-15px]">
          <Dialog.Title className="m-0 text-[17px] font-medium">
            Are you sure you want to delete{" "}
            <span className="italic font-bold mr-[2px]">
              {expenseOrIncome.title}
            </span>
            ?
          </Dialog.Title>
          <Dialog.Description className="text-night-300 mt-2 text-[15px] leading-normal">
            To delete{" "}
            <span className="italic font-bold">{expenseOrIncome.title}</span>,
            click delete or cancel to go back.
          </Dialog.Description>
          <Form method="post" replace className="mt-5 flex flex-col gap-4">
            <div className="mt-3 flex gap-2">
              <Button type="submit" className="bg-red-600 hover:bg-red-900">
                delete
              </Button>
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
