import {
  json,
  type LoaderArgs,
  redirect,
  type ActionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { safeRedirect, unauthorized } from "remix-utils";
import authenticated, {
  authCookie,
  deleteIncome,
  getIncomeById,
} from "~/lib/supabase.server";
import { Form, useLoaderData } from "@remix-run/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/Dialog";
import Button from "~/components/Button";
import MyLinkBtn from "~/components/MyLinkBtn";
import useRedirectTo from "~/hooks/useRedirectTo";
import ModalMessage from "~/components/ModalMessage";
import type { Income } from "~/types";

export const meta: MetaFunction = ({ data }) => {
  if (!data?.income)
    return {
      title: "Not found | X Man",
    };
  return {
    title: `Delete ${(data as unknown as LoaderData).income.title} | X Man`,
  };
};

type LoaderData = {
  message: string;
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
      income: null,
    });
  }

  const id = params.id;

  if (!id) {
    throw redirect(safeRedirect(redirectTo, "/app"));
  }

  const { income, error } = await getIncomeById({ incomeId: id, userId });
  if (!income || error) {
    return json({ message: "Not found.", income: null }, 404);
  }

  return json({
    income: income,
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

      if (!id) {
        throw redirect(safeRedirect(redirectTo, "/app"));
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
  const { income } = useLoaderData<typeof loader>();
  const redirectTo = useRedirectTo() || "/app/dashboard";

  if (!income) {
    return (
      <ModalMessage
        title="Not found"
        message="We couldn't find an expense or an income. Please head back to the month view"
      />
    );
  }

  return (
    <Dialog open modal>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete{" "}
            <span className="mr-[2px] font-bold italic">{income.title}</span>?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          To delete <span className="font-bold italic">{income.title}</span>,
          click delete or cancel to go back.
        </DialogDescription>
        <Form method="post" replace className="flex flex-col gap-4">
          <DialogFooter>
            <div className="mt-3 flex gap-2">
              <Button type="submit" className="bg-red-600 hover:bg-red-900">
                delete
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
