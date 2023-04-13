import {
  type MetaFunction,
  type LoaderArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  useLoaderData,
  Form,
  useSubmit,
  useSearchParams,
  useLocation,
  Link,
  Outlet,
} from "@remix-run/react";
import { useRef } from "react";
import { unauthorized } from "remix-utils";
import MyTooltip from "~/components/MyTooltip";
import {
  authCookie,
  getAllDefaultCategories,
  getAllUserCategories,
  getAllUserExpenseCategories,
  getAllUserIncomeCategories,
} from "~/lib/supabase.server";
import type { Category } from "~/types";
import { EditIcon, Trash2Icon } from "lucide-react";
import { getRelativeTime } from "~/utils/client";
import Divider from "~/components/Divider";
import MyLinkBtn from "~/components/MyLinkBtn";

export const meta: MetaFunction = () => {
  return {
    title: "Categories | X Man",
  };
};

type CATEGORY_FILTERS = "all" | "income" | "expense";

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

  const searchParams = new URL(request.url).searchParams;
  const categoryFilter = searchParams.get(
    "categories"
  ) as CATEGORY_FILTERS | null;
  if (!categoryFilter) {
    return redirect("?categories=all");
  }

  const { categories: defaultCategories } = await getAllDefaultCategories();

  if (categoryFilter === "expense") {
    const { expenseCategories: categories, error } =
      await getAllUserExpenseCategories({ userId });
    if (!categories || categories?.length === 0 || error) {
      return json({
        categories: [],
        defaultCategories,
        error: "No expense categories found",
      });
    }

    return json({ categories, defaultCategories, error: "" });
  } else if (categoryFilter === "income") {
    const { incomeCategories: categories, error } =
      await getAllUserIncomeCategories({ userId });
    if (!categories || categories?.length === 0 || error) {
      return json({
        categories: [],
        defaultCategories,
        error: "No income categories found",
      });
    }

    return json({ categories, defaultCategories, error: "" });
  }

  const { categories, error } = await getAllUserCategories({ userId });
  if (!categories || categories?.length === 0 || error) {
    return json({
      categories: [],
      defaultCategories,
      error: "No categories found",
    });
  }

  return json({ categories, defaultCategories, error: "" });
}

export default function Categories() {
  const { categories, defaultCategories, error } =
    useLoaderData<typeof loader>();
  const location = useLocation();
  const submitFilters = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchParams] = useSearchParams();

  function handleFilterChange() {
    if (formRef) {
      submitFilters(formRef.current);
    }
  }

  const categoriesFilter = searchParams.get(
    "categories"
  ) as CATEGORY_FILTERS | null;

  return (
    <>
      <div className="px-5 pt-4 lg:px-20">
        <h1 className="text-3xl font-bold">Your Categories</h1>
        <div className="mt-5">
          <MyLinkBtn
            to={`new?redirectTo=${location.pathname}${location.search}`}
          >
            Add
          </MyLinkBtn>
        </div>
        <div
          className="mt-5 flex flex-row items-center gap-3"
          onChange={handleFilterChange}
        >
          <Form method="get" ref={formRef}>
            <select
              name="categories"
              className="custom-select"
              defaultValue={categoriesFilter || "all"}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </Form>
        </div>
        <div className="mt-4">
          {error && categories.length === 0 ? (
            <>
              <p className="text-2xl">Nothing to show :(</p>
              <p className="mt-1 text-xl">{error}</p>
            </>
          ) : (
            <div className="flex flex-col flex-wrap gap-8 md:flex-row">
              {categories.map((category) => (
                <Card key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Divider className="mt-5" />
      <div className="px-5 lg:px-20">
        <div className="my-5">
          {defaultCategories ? (
            <div className="flex flex-col flex-wrap gap-8 md:flex-row">
              {defaultCategories.map((category) => (
                <Card key={category.id} category={category} editable={true} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <Outlet />
    </>
  );
}

type CardProps = { category: Category; editable?: boolean };
function Card({ category, editable }: CardProps) {
  const location = useLocation();
  const isIncome = !category.expense;

  return (
    <div
      className={`flex flex-col rounded-lg border py-3 px-6 text-night-700 md:w-80 ${
        isIncome ? "bg-green-200" : "bg-red-200"
      }`}
    >
      <div className="flex flex-row items-center justify-between">
        <p className="text-2xl font-bold">{category.name}</p>
        {editable ? (
          <div></div>
        ) : (
          <div className="flex flex-row gap-3">
            <MyTooltip title={`Edit ${category.name}`}>
              <button type="button">
                <Link
                  to={`${isIncome ? "income/" : "expenses/"}${
                    category.id
                  }/edit?redirectTo=${location.pathname}${location.search}`}
                  aria-label={`Edit ${category.name}`}
                >
                  <EditIcon size="24" />
                </Link>
                <span className="sr-only">{`Edit ${category.name}`}</span>
              </button>
            </MyTooltip>
            <MyTooltip title={`Delete ${category.name}`}>
              <button type="button">
                <Link
                  to={`${isIncome ? "income/" : "expenses/"}${
                    category.id
                  }/delete?redirectTo=${location.pathname}${location.search}`}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2Icon size="24" className="text-red-600" />
                </Link>
                <span className="sr-only">{`Delete ${category.name}`}</span>
              </button>
            </MyTooltip>
          </div>
        )}
      </div>
      <p className="text-md mt-5 italic text-night-300">
        {editable ? (
          <>default category</>
        ) : (
          <>added {getRelativeTime(category.created_at || "")}</>
        )}
      </p>
    </div>
  );
}
