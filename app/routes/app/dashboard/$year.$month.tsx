import { json, type LoaderArgs } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import Chip from "~/components/Chip";
import {
  authCookie,
  getAllCategories,
  getAllExpenses,
  getAllIncome,
} from "~/lib/supabase.server";
import type { Category, Expense } from "~/types";
import { useContext, useRef } from "react";
import { DateContext } from "~/utils/client/DateContext";
import MyLinkBtn from "~/components/MyLinkBtn";
import { promiseHash, unauthorized } from "remix-utils";
import FilterChip from "~/components/FilterChip";
import { SEVA_CATEGORY, getRelativeTime } from "~/utils/client";
import MyTooltip from "~/components/MyTooltip";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CalendarDaysIcon,
  EditIcon,
  Trash2Icon,
} from "lucide-react";
import Divider from "~/components/Divider";

interface ModifiedExpenseAndIncome extends Omit<Expense, "categories"> {
  type: "income" | "expense";
  categories: Array<string>;
}

export async function loader({ params, request }: LoaderArgs) {
  const authSession = await authCookie.getSession(
    request.headers.get("Cookie")
  );
  const userId = authSession.get("user_id");
  if (!userId || typeof userId !== "string") {
    throw unauthorized({
      message: "You must be logged in to access this page",
    });
  }
  const year = params.year || new Date().getFullYear().toString();
  const month = params.month || (new Date().getMonth() + 1).toString();
  const searchParams = new URL(request.url).searchParams;
  const tags = searchParams.getAll("tags") ?? [];

  const {
    expenses: { expenses, filteredExpenses },
    income: { income, filteredIncome },
  } = await promiseHash({
    expenses: getAllExpenses({
      userId,
      month,
      year,
      tags,
    }),
    income: getAllIncome({
      userId,
      month,
      year,
      tags,
    }),
  });
  const { categories } = await getAllCategories({ userId })
  
  let sortedCategories =
  categories && categories?.length > 0
  ? [SEVA_CATEGORY, ...categories] satisfies Array<Category>
  : [SEVA_CATEGORY] satisfies Array<Category>;

  if (categories && tags.length > 0) {
    const selectedCategories = categories.filter((category) =>
      tags.includes(category.name)
    );
    const restCategories = categories.filter(
      (category) => !tags.includes(category.name)
    );
    sortedCategories = [
      ...selectedCategories,
      SEVA_CATEGORY,
      ...restCategories,
    ];
  }

  let data: Array<ModifiedExpenseAndIncome> = [],
    filteredData: Array<ModifiedExpenseAndIncome> = [],
    totalExpense = 0,
    totalIncome = 0,
    totalTenPer = 0;

  // If expenses and income are undefined or expenses and income have 0 length
  if (
    (!income && !expenses) ||
    (expenses?.length! <= 0 && income?.length! <= 0)
  ) {
    return json({
      data,
      filteredData,
      totalExpense,
      totalIncome,
      totalTenPer,
      categories: sortedCategories,
      tags,
    });
  }

  // Income is present
  if (!expenses || expenses.length <= 0) {
    if (income && income.length > 0) {
      const incomeAmounts = income.map(
        (individualIncome) => individualIncome.amount
      );
      totalIncome = incomeAmounts.reduce(
        (prevIncome, currIncome) => Number(prevIncome) + Number(currIncome),
        0
      );
      const sevaIncome = income.filter(
        (individualIncome) => individualIncome.seva
      );
      const totalIncomeWithTenPer = sevaIncome.reduce(
        (prevIncome, currIncome) =>
          Number(prevIncome) + Number(currIncome.amount),
        0
      );
      totalTenPer = totalIncomeWithTenPer / 10;
      const modifiedIncome = income.map((individualIncome) => {
        const categories = individualIncome.categories?.split(",") || [];
        return { ...individualIncome, type: "income" as const, categories };
      });
      data = modifiedIncome;
    }
    if (filteredIncome && filteredIncome.length > 0) {
      const modifiedFilteredIncome = filteredIncome.map(
        (individualFilteredIncome) => {
          const categories =
            individualFilteredIncome?.categories?.split(",") || [];
          return {
            ...individualFilteredIncome,
            type: "income" as const,
            categories,
          };
        }
      );
      filteredData = modifiedFilteredIncome;
    }

    return json({
      data,
      filteredData,
      totalExpense,
      totalIncome,
      totalTenPer,
      categories: sortedCategories,
      tags,
    });
  }

  // Expense is present
  if (!income || income.length <= 0) {
    if (expenses && expenses.length > 0) {
      const expenseAmounts = expenses.map(
        (individualExpense) => individualExpense.amount
      );
      totalExpense = expenseAmounts.reduce(
        (prevExpense, currExpense) => Number(prevExpense) + Number(currExpense),
        0
      );
      const modifiedExpenses = expenses.map((individualExpense) => {
        const categories = individualExpense.categories?.split(",") || [];
        return { ...individualExpense, type: "expense" as const, categories };
      });
      data = modifiedExpenses;
    }
    if (filteredExpenses && filteredExpenses.length > 0) {
      const modifiedFilteredExpense = filteredExpenses.map(
        (individualFilteredExpense) => {
          const categories =
            individualFilteredExpense.categories?.split(",") || [];
          return {
            ...individualFilteredExpense,
            type: "expense" as const,
            categories,
          };
        }
      );
      filteredData = modifiedFilteredExpense;
    }

    return json({
      data,
      filteredData,
      totalExpense,
      totalIncome,
      totalTenPer,
      categories: sortedCategories,
      tags,
    });
  }

  const expenseAmounts = expenses.map(
    (individualExpense) => individualExpense.amount
  );
  const incomeAmounts = income.map(
    (individualIncome) => individualIncome.amount
  );
  const sevaIncome = income.filter((individualIncome) => individualIncome.seva);
  totalExpense = expenseAmounts.reduce(
    (prevExpense, currExpense) => Number(prevExpense) + Number(currExpense),
    0
  );
  totalIncome = incomeAmounts.reduce(
    (prevIncome, currIncome) => Number(prevIncome) + Number(currIncome),
    0
  );
  const totalIncomeWithTenPer = sevaIncome.reduce(
    (prevIncome, currIncome) => Number(prevIncome) + Number(currIncome.amount),
    0
  );
  totalTenPer = totalIncomeWithTenPer / 10;

  const modifiedExpenses = expenses.map((individualExpense) => {
    const categories = individualExpense.categories?.split(",") || [];
    return { ...individualExpense, type: "expense" as const, categories };
  });
  const modifiedIncome = income.map((individualIncome) => {
    const categories = individualIncome.categories?.split(",") || [];
    return { ...individualIncome, type: "income" as const, categories };
  });
  const expensesAndIncome = [...modifiedExpenses, ...modifiedIncome];
  const sortedExpensesAndIncome = expensesAndIncome.sort((a, b) => {
    const dateA = new Date(a.created_at!).getTime();
    const dateB = new Date(b.created_at!).getTime();
    if (dateA < dateB) {
      return 1;
    }
    if (dateA > dateB) {
      return -1;
    }
    return 0;
  });

  const modifiedFilteredExpenses = filteredExpenses!.map(
    (individualFilteredExpense) => {
      const categories = individualFilteredExpense.categories?.split(",") || [];
      return {
        ...individualFilteredExpense,
        type: "expense" as const,
        categories,
      };
    }
  );
  const modifiedFilteredIncome = filteredIncome!.map(
    (individualFilteredIncome) => {
      const categories = individualFilteredIncome.categories?.split(",") || [];
      return {
        ...individualFilteredIncome,
        type: "income" as const,
        categories,
      };
    }
  );
  const filteredExpensesAndIncome = [
    ...modifiedFilteredExpenses,
    ...modifiedFilteredIncome,
  ];
  const sortedFilteredExpensesAndIncome = filteredExpensesAndIncome.sort(
    (a, b) => {
      const dateA = new Date(a.created_at!).getTime();
      const dateB = new Date(b.created_at!).getTime();
      if (dateA < dateB) {
        return 1;
      }
      if (dateA > dateB) {
        return -1;
      }
      return 0;
    }
  );

  return json({
    data: sortedExpensesAndIncome,
    filteredData: sortedFilteredExpensesAndIncome,
    totalExpense,
    totalIncome,
    totalTenPer,
    categories: sortedCategories,
    tags,
  });
}

export default function Month() {
  const {
    data,
    filteredData,
    totalExpense,
    totalIncome,
    totalTenPer,
    categories,
    tags,
  } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const expensesAndIncome = searchParams.get("tags") ? filteredData : data;
  const { month, year } = useParams();
  const { month: contextMonth, year: contextYear } = useContext(DateContext);
  const submitFilters = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  const goNextLink = () => {
    let nextMonth = Number(month) + 1;
    let nextYear = Number(year);

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    return `/app/dashboard/${nextYear}/${nextMonth}${location.search}`;
  };
  const goPrevLink = () => {
    let prevMonth = Number(month) - 1;
    let prevYear = Number(year);

    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }

    return `/app/dashboard/${prevYear}/${prevMonth}${location.search}`;
  };

  const isCurrentYearMonth = year === contextYear && month === contextMonth;

  const monthName = getMonthName(month || "0");
  const isBalanceNegative = totalIncome - totalExpense < 0;

  function handleFilterChange() {
    if (formRef) {
      submitFilters(formRef.current);
    }
  }

  return (
    <>
      <div className="mobile-top-sticky-bar sticky md:top-[40px] bg-day-100 dark:bg-night-700">
        <div className="px-5 pt-5 lg:px-20">
          <div className="flex items-center gap-4">
            <div className="flex">
              <MyTooltip title="Previous month">
                <button type="button">
                  <Link to={goPrevLink()} aria-label="Go to previous month">
                    <ChevronLeftIcon size="36" />
                  </Link>
                  <span className="sr-only">Go to previous month</span>
                </button>
              </MyTooltip>
              <MyTooltip title="Next month">
                <button type="button">
                  <Link to={goNextLink()} aria-label="Go to next month">
                    <ChevronRightIcon size="36" />
                  </Link>
                  <span className="sr-only">Go to next month</span>
                </button>
              </MyTooltip>
            </div>
            <p className="text-3xl">{monthName}</p>
            {!isCurrentYearMonth ? (
              <div className="ml-3 flex items-center">
                <MyTooltip title="Jump to current month">
                  <button type="button">
                    <Link
                      to={`/app/dashboard/${contextYear}/${contextMonth}${location.search}`}
                      aria-label="Jump to current month"
                    >
                      <CalendarDaysIcon size="28" />
                    </Link>
                    <span className="sr-only">Jump to current month</span>
                  </button>
                </MyTooltip>
              </div>
            ) : null}
          </div>
        </div>
        <Divider className="mt-4" />
      </div>
      <div className="px-5 pt-4 lg:px-20">
        <p className="text-3xl font-bold">
          {monthName}'s balance:{" "}
          <span
            className={`${
              !isBalanceNegative ? "text-green-700" : "text-accent-red"
            }`}
          >
            {getFormattedCurrency(totalIncome - totalExpense)}
          </span>
        </p>
        <div className="mt-3 flex flex-row gap-4">
          <div className="flex-1 rounded-lg bg-green-200 px-4 py-6 text-center text-xl text-night-700 md:flex-none md:px-10 md:text-2xl">
            <p className="font-bold">Income</p>
            <p className="mt-4">Total: {getFormattedCurrency(totalIncome)}</p>
            <Chip className="mt-3 text-left text-base">
              {getFormattedCurrency(totalTenPer)} is 10%
            </Chip>
          </div>
          <div className="flex-1 rounded-lg bg-red-200 px-4 py-6 text-center text-xl text-night-700 md:flex-none md:px-10 md:text-2xl">
            <p className="font-bold">Expenses</p>
            <p className="mt-4">Total: {getFormattedCurrency(totalExpense)}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-row gap-3">
          <MyLinkBtn
            to={`income/new?redirectTo=${location.pathname}${location.search}`}
            className="flex-1 bg-green-200 text-center text-night-700 transition-colors hover:bg-green-300 md:flex-none"
          >
            Add income
          </MyLinkBtn>
          <MyLinkBtn
            to={`expenses/new?redirectTo=${location.pathname}${location.search}`}
            className="flex-1 bg-red-200 text-center text-night-700 transition-colors hover:bg-red-300 md:flex-none"
          >
            Add expense
          </MyLinkBtn>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2 pl-5 lg:pl-20">
        <p className="text-xl font-bold">Filter tags</p>
        <div onChange={handleFilterChange}>
          <Form
            method="get"
            className="custom-scrollbar flex w-full flex-row items-center gap-2 overflow-y-auto pb-1"
            ref={formRef}
          >
            {categories.map((category) => (
              <FilterChip
                key={category.id}
                className={(checked) => {
                  return checked
                    ? "whitespace-nowrap cursor-pointer bg-accent-purple"
                    : "whitespace-nowrap cursor-pointer bg-dark-muted-100 checked:bg-accent-purple hover:bg-dark-muted-200 dark:bg-night-500 dark:hover:bg-night-600";
                }}
                name="tags"
                value={category.name}
                selected={tags.includes(category.name)}
              >
                {category.name}
              </FilterChip>
            ))}
          </Form>
        </div>
      </div>
      <div className="px-5 pb-5 lg:px-20">
        <div className="mt-5">
          {expensesAndIncome.length <= 0 ? (
            <>
              <p className="text-2xl">Nothing to show :(</p>
              <p className="mt-1 text-xl">
                Please add an expense or an income to have it displayed here.
              </p>
            </>
          ) : (
            <div className="flex flex-col flex-wrap gap-8 md:flex-row">
              {expensesAndIncome.map((individualExpenseOrIncome) => (
                <Card
                  key={individualExpenseOrIncome.id}
                  expenseOrIncome={individualExpenseOrIncome}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Outlet />
    </>
  );
}

function Card({
  expenseOrIncome,
}: {
  expenseOrIncome: ModifiedExpenseAndIncome;
}) {
  const location = useLocation();
  const isIncome = expenseOrIncome.type === "income";

  return (
    <div
      className={`flex flex-col rounded-lg border py-3 px-6 text-night-700 md:w-80 ${
        isIncome ? "bg-green-200" : "bg-red-200"
      }`}
    >
      <div className="flex flex-row items-center justify-between">
        <p className="text-2xl font-bold">{expenseOrIncome.title}</p>
        <div className="flex flex-row gap-3">
          <MyTooltip title={`Edit ${expenseOrIncome.title}`}>
            <button type="button">
              <Link
                to={`${isIncome ? "income/" : "expenses/"}${
                  expenseOrIncome.id
                }/edit?redirectTo=${location.pathname}${location.search}`}
                aria-label={`Edit ${expenseOrIncome.title}`}
              >
                <EditIcon size="24" />
              </Link>
              <span className="sr-only">{`Edit ${expenseOrIncome.title}`}</span>
            </button>
          </MyTooltip>
          <MyTooltip title={`Delete ${expenseOrIncome.title}`}>
            <button type="button">
              <Link
                to={`${isIncome ? "income/" : "expenses/"}${
                  expenseOrIncome.id
                }/delete?redirectTo=${location.pathname}${location.search}`}
                aria-label={`Delete ${expenseOrIncome.title}`}
              >
                <Trash2Icon size="24" className="text-red-600" />
              </Link>
              <span className="sr-only">{`Delete ${expenseOrIncome.title}`}</span>
            </button>
          </MyTooltip>
        </div>
      </div>
      <div className="flex-1">
        <div className="mt-2 flex flex-wrap gap-2">
          {expenseOrIncome.categories
            ? expenseOrIncome.categories.map((category, index) => (
                <Chip key={`${category}-${index}`}>{category}</Chip>
              ))
            : null}
        </div>
      </div>
      <p className="mt-4 text-xl">
        {getFormattedCurrency(Number(expenseOrIncome.amount))}
      </p>
      <p className="text-md mt-5 italic text-night-300">
        added {getRelativeTime(expenseOrIncome.created_at || "")}
      </p>
    </div>
  );
}

function getFormattedCurrency(number: number) {
  let USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return USDollar.format(number);
}

function getMonthName(monthNumber: string) {
  const date = new Date();
  date.setMonth(Number(monthNumber) - 1);

  return date.toLocaleString("en-US", { month: "long" });
}
