import { json, type LoaderArgs } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useParams,
} from "@remix-run/react";
import Chip from "~/components/Chip";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  authCookie,
  getAllExpenses,
  getAllIncome,
} from "~/lib/supabase.server";
import type { Expense } from "~/types";
import { useContext } from "react";
import { DateContext } from "~/utils/client/DateContext";
import MyLinkBtn from "~/components/MyLinkBtn";
import { unauthorized } from "remix-utils";

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

  const { expenses } = await getAllExpenses({
    userId,
    month,
    year,
  });

  const { income } = await getAllIncome({
    userId,
    month,
    year,
  });

  let data: Array<ModifiedExpenseAndIncome> = [],
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
      totalExpense,
      totalIncome,
      totalTenPer,
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
      const incomeWithTenPer = income.filter(
        (individualIncome) => individualIncome.addInTenPer
      );
      const totalIncomeWithTenPer = incomeWithTenPer.reduce(
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

    return json({
      data,
      totalExpense,
      totalIncome,
      totalTenPer,
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

    return json({
      data,
      totalExpense,
      totalIncome,
      totalTenPer,
    });
  }

  const expenseAmounts = expenses.map(
    (individualExpense) => individualExpense.amount
  );
  const incomeAmounts = income.map(
    (individualIncome) => individualIncome.amount
  );
  const incomeWithTenPer = income.filter(
    (individualIncome) => individualIncome.addInTenPer
  );
  totalExpense = expenseAmounts.reduce(
    (prevExpense, currExpense) => Number(prevExpense) + Number(currExpense),
    0
  );
  totalIncome = incomeAmounts.reduce(
    (prevIncome, currIncome) => Number(prevIncome) + Number(currIncome),
    0
  );
  const totalIncomeWithTenPer = incomeWithTenPer.reduce(
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

  return json({
    data: sortedExpensesAndIncome,
    totalExpense,
    totalIncome,
    totalTenPer,
  });
}

export default function Month() {
  const {
    data: expensesAndIncome,
    totalExpense,
    totalIncome,
    totalTenPer,
  } = useLoaderData<typeof loader>();
  const { month, year } = useParams();
  const { month: contextMonth, year: contextYear } = useContext(DateContext);
  const location = useLocation();

  const goNextLink = () => {
    let nextMonth = Number(month) + 1;
    let nextYear = Number(year);

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    return `/app/dashboard/${nextYear}/${nextMonth}`;
  };
  const goPrevLink = () => {
    let prevMonth = Number(month) - 1;
    let prevYear = Number(year);

    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }

    return `/app/dashboard/${prevYear}/${prevMonth}`;
  };

  const isCurrentYearMonth = year === contextYear && month === contextMonth;

  const monthName = getMonthName(month || "0");
  const isBalanceNegative = totalIncome - totalExpense < 0;

  return (
    <>
      <div>
        <div className="flex items-center gap-4">
          <div className="flex">
            <MyTooltip title="Previous month">
              <Link to={goPrevLink()} aria-label="Previous month">
                <ChevronLeftIcon size="36" />
              </Link>
            </MyTooltip>
            <MyTooltip title="Next month">
              <Link
                to={goNextLink()}
                aria-label="Next month"
                title="Next month"
              >
                <ChevronRightIcon size="36" />
              </Link>
            </MyTooltip>
          </div>
          <p className="text-3xl">{monthName}</p>
          {!isCurrentYearMonth ? (
            <div className="ml-3">
              <MyTooltip title="Jump to current month">
                <Link to={`/app/dashboard/${contextYear}/${contextMonth}`}>
                  <ReplyIcon size="36" />
                </Link>
              </MyTooltip>
            </div>
          ) : null}
        </div>
        <p className="mt-4 text-3xl font-bold border-t border-night-400 pt-4">
          {monthName}'s balance:{" "}
          <span
            className={`${
              !isBalanceNegative ? "text-green-700" : "text-accent-red"
            }`}
          >
            {getFormattedCurrency(totalIncome - totalExpense)}
          </span>
        </p>
        <div className="flex flex-row gap-4 mt-3">
          <div className="text-xl md:text-2xl text-night-700 bg-green-200 rounded-lg px-4 md:px-10 py-6 text-center">
            <p className="font-bold">Income</p>
            <p className="mt-4">Total: {getFormattedCurrency(totalIncome)}</p>
            <div className="mt-3 text-base bg-dark-muted-100 rounded-lg text-left py-1 px-3">
              <p>{getFormattedCurrency(totalTenPer)} is 10%</p>
            </div>
          </div>
          <div className="text-night-700 text-xl md:text-2xl bg-red-200 rounded-lg px-4 md:px-10 py-6 text-center">
            <p className="font-bold">Expenses</p>
            <p className="mt-4">Total: {getFormattedCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <MyLinkBtn to={`new?redirectTo=${location.pathname}`}>Add</MyLinkBtn>
      </div>
      {expensesAndIncome.length <= 0 ? (
        <div className="mt-5">
          <p className="text-2xl">Nothing to show :(</p>
          <p className="text-xl mt-1">
            Please add an expense or an income to have it displayed here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-wrap gap-8 mt-5">
          {expensesAndIncome.map((individualExpenseOrIncome) => (
            <Card
              key={individualExpenseOrIncome.id}
              expenseOrIncome={individualExpenseOrIncome}
            />
          ))}
        </div>
      )}
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
      className={`md:w-80 py-3 px-6 text-night-700 border flex flex-col rounded-lg ${
        isIncome ? "bg-green-200" : "bg-red-200"
      }`}
    >
      <div className="flex flex-row justify-between items-center">
        <p className="text-2xl font-bold">{expenseOrIncome.title}</p>
        <div className="flex flex-row gap-3">
          <MyTooltip title={`Edit ${expenseOrIncome.title}`}>
            <Link
              to={`${expenseOrIncome.id}/edit?redirectTo=${location.pathname}&isIncome=${isIncome}`}
            >
              <EditIcon size="24" />
            </Link>
          </MyTooltip>
          <MyTooltip title={`Delete ${expenseOrIncome.title}`}>
            <Link
              to={`${expenseOrIncome.id}/delete?redirectTo=${location.pathname}&isIncome=${isIncome}`}
            >
              <DeleteIcon size="24" />
            </Link>
          </MyTooltip>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex gap-2 flex-wrap mt-2">
          {expenseOrIncome.categories
            ? expenseOrIncome.categories.map((category, index) => (
                <Chip key={`${category}-${index}`}>{category}</Chip>
              ))
            : null}
        </div>
      </div>
      <p className="text-xl mt-4">
        {getFormattedCurrency(Number(expenseOrIncome.amount))}
      </p>
      <p className="text-md text-night-300 italic mt-5">
        added {getRelativeTime(expenseOrIncome.created_at || "")}
      </p>
    </div>
  );
}

function ChevronLeftIcon({ size }: { size: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m14 7l-5 5l5 5"
      />
    </svg>
  );
}

function ChevronRightIcon({ size }: { size: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m10 7l5 5l-5 5"
      />
    </svg>
  );
}

function ReplyIcon({ size }: { size: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M10 9V5l-7 7l7 7v-4.1c5 0 8.5 1.6 11 5.1c-1-5-4-10-11-11Z"
      />
    </svg>
  );
}

function EditIcon({ size }: { size: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 4C5.34315 4 4 5.34315 4 7V17C4 18.6569 5.34315 20 7 20H17C18.6569 20 20 18.6569 20 17V11C20 10.4477 20.4477 10 21 10C21.5523 10 22 10.4477 22 11V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V7C2 4.23858 4.23858 2 7 2H13C13.5523 2 14 2.44772 14 3C14 3.55228 13.5523 4 13 4H7Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.2156 2.82088C17.7412 2.29528 18.4541 2 19.1974 2C19.9407 2 20.6535 2.29528 21.1791 2.82088C21.7047 3.34648 22 4.05934 22 4.80265C22 5.54596 21.7047 6.25883 21.1791 6.78443L20.396 7.56757C20.0055 7.9581 19.3723 7.9581 18.9818 7.56757L16.4324 5.01824C16.0419 4.62771 16.0419 3.99455 16.4324 3.60402L17.2156 2.82088ZM15.0182 6.43245C14.6277 6.04192 13.9945 6.04192 13.604 6.43245L9.14269 10.8938C9.01453 11.0219 8.92362 11.1825 8.87966 11.3583L8.02988 14.7575C7.94468 15.0982 8.04453 15.4587 8.29291 15.7071C8.54129 15.9555 8.90178 16.0553 9.24256 15.9701L12.6417 15.1204C12.8175 15.0764 12.9781 14.9855 13.1062 14.8573L17.5676 10.396C17.9581 10.0055 17.9581 9.37231 17.5676 8.98179L15.0182 6.43245Z"
        fill="currentColor"
      />
    </svg>
  );
}

function DeleteIcon({ size }: { size: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        className="fill-none stroke-red-600"
        d="M16.88,22.5H7.12a1.9,1.9,0,0,1-1.9-1.8L4.36,5.32H19.64L18.78,20.7A1.9,1.9,0,0,1,16.88,22.5Z"
      />
      <line
        className="fill-none stroke-red-600"
        x1="2.45"
        y1="5.32"
        x2="21.55"
        y2="5.32"
      />
      <path
        className="fill-none stroke-red-600"
        d="M10.09,1.5h3.82a1.91,1.91,0,0,1,1.91,1.91V5.32a0,0,0,0,1,0,0H8.18a0,0,0,0,1,0,0V3.41A1.91,1.91,0,0,1,10.09,1.5Z"
      />
      <line
        className="fill-none stroke-red-600"
        x1="12"
        y1="8.18"
        x2="12"
        y2="19.64"
      />
      <line
        className="fill-none stroke-red-600"
        x1="15.82"
        y1="8.18"
        x2="15.82"
        y2="19.64"
      />
      <line
        className="fill-none stroke-red-600"
        x1="8.18"
        y1="8.18"
        x2="8.18"
        y2="19.64"
      />
    </svg>
  );
}

function MyTooltip({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-lg bg-day-100 dark:bg-night-500 px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] dark:shadow-[hsl(0_0%_0%_/_35%)_0px_10px_38px_-10px,_hsl(0_0%_0%_/_35%)_0px_10px_20px_-15px] will-change-[transform,opacity]"
            sideOffset={5}
          >
            {title}
            <Tooltip.Arrow className="fill-day-100 dark:fill-night-500" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

const DAY_MILLISECONDS = 1000 * 60 * 60 * 24;

function getRelativeTime(dateString: string) {
  const date = dateString === "" ? new Date() : new Date(dateString);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const daysDifference = Math.round(
    (date.getTime() - new Date().getTime()) / DAY_MILLISECONDS
  );

  return rtf.format(daysDifference, "day");
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
