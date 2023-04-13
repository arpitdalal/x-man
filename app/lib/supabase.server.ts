import {
  createCookieSessionStorage,
  redirect,
  type Session,
} from "@remix-run/node";
import {
  createClient,
  type User,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";
import { promiseHash, safeRedirect } from "remix-utils";
import type { Category, Expense, Income } from "~/types";
import type { Database } from "~/types/supabase";
import { SEVA_CATEGORY } from "~/utils/client";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_KEY: string;
      SESSION_SECRET: string;
    }
  }
}

type AuthForm = {
  email: string;
  password: string;
};

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL is required");
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY is required");
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_SERVICE_KEY is required");
}

const supabaseOptions: SupabaseClientOptions<"public"> = {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: { "x-application-name": "X Man" },
  },
};

const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  supabaseOptions
);

export const authCookie = createCookieSessionStorage({
  cookie: {
    name: "sb:token",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export function setAuthSession(
  session: Session,
  accessToken: string,
  refreshToken: string,
  userId: User["id"]
) {
  try {
    session.set("access_token", accessToken);
    session.set("refresh_token", refreshToken);
    session.set("user_id", userId);

    return { session };
  } catch {
    return {
      error: "something went wrong",
    };
  }
}

function hasAuthSession(session: Session) {
  try {
    return session.has("access_token");
  } catch {
    return false;
  }
}

export async function hasActiveAuthSession(session: Session) {
  try {
    if (!hasAuthSession(session)) return false;

    const { user, error } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (error || !user) return false;
    return true;
  } catch {
    return false;
  }
}

export async function refreshUserToken(session: Session) {
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: session.get("refresh_token"),
    });

    if (error || !data || !data.session || !data.user) {
      return { error: error?.message };
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      userId: data.user.id,
    };
  } catch {
    return { error: "Something went wrong" };
  }
}

export async function loginUser({ email, password }: AuthForm) {
  try {
    const { data, error: loginError } =
      await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (loginError || !data || !data.session || !data.user) {
      return { error: loginError?.message };
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      userId: data.user.id,
    };
  } catch {
    return { error: "Something went wrong" };
  }
}

export async function registerUser({ email, password }: AuthForm) {
  try {
    const { data, error: signUpError } = await supabaseAdmin.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data || !data.user) {
      return { error: signUpError?.message };
    }

    return { user: data.user };
  } catch {
    return {
      error: "Something went wrong",
    };
  }
}

export async function signOutUser(session: Session) {
  try {
    const { error } = await supabaseAdmin.auth.signOut();
    if (error) {
      return { done: false, error: error.message };
    }
    return { done: true };
  } catch {
    return {
      done: false,
      error: "Something went wrong",
    };
  }
}

export async function getUserByAccessToken(accessToken: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error || !data.user) {
      return { error: error?.message };
    }

    return { user: data.user };
  } catch {
    return {
      error: "Something went wrong",
    };
  }
}

export async function sendResetPasswordEmailForUser({
  email,
  redirectTo,
}: {
  email: string;
  redirectTo: string;
}) {
  try {
    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(
      email,
      {
        redirectTo,
      }
    );

    if (error || data === null) {
      return { error: error.message };
    }
    return {};
  } catch (error) {
    return {
      error: "Something went wrong",
    };
  }
}

export async function resetPasswordForUser({
  password,
  session,
}: {
  password: string;
  session: Session;
}) {
  try {
    const { user, error: userError } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (userError || !user) {
      return { error: userError };
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password,
      }
    );

    if (error || !data) {
      return { error: error?.message };
    }

    return { user: data.user };
  } catch {
    return {
      error: "Something went wrong",
    };
  }
}

export default async function authenticated(
  request: Request,
  successFunction: (user: User) => Response | Promise<Response>,
  failureFunction: () => Response | Promise<Response>,
  redirectTo?: string
) {
  try {
    let session = await authCookie.getSession(request.headers.get("Cookie"));
    const url = new URL(request.url);
    const redirectUrl = redirectTo || `${url.pathname}${url.search}`;

    const isActiveAuthSession = await hasActiveAuthSession(session);
    if (!isActiveAuthSession) {
      const { accessToken, refreshToken, userId, error } =
        await refreshUserToken(session);
      if (error || !accessToken || !refreshToken || !userId) {
        throw new Error("refreshUserToken " + error);
      }
      const { session: newSession, error: newSessionError } = setAuthSession(
        session,
        accessToken,
        refreshToken,
        userId
      );

      if (!newSession || newSessionError) {
        throw new Error("setAuthSession " + newSessionError);
      }

      return redirect(safeRedirect(redirectUrl, "/"), {
        headers: {
          "Set-Cookie": await authCookie.commitSession(newSession, {
            expires: new Date(Date.now() + 3600),
          }),
        },
      });
    }

    const { user, error: accessTokenError } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (accessTokenError || !user || !user.email || !user.id) {
      throw new Error("getUserByAccessToken " + accessTokenError);
    }

    return await successFunction(user);
  } catch (error) {
    console.log(error);
    return failureFunction();
  }
}

export async function getProfileById(userId: User["id"]) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !profile) {
      console.log("getProfileById", error);
      return {
        error: error.message,
      };
    }

    return { profile };
  } catch (error) {
    // TODO: log error nicely
    console.log("getProfileById ", error);
    return {
      error: "Something went wrong",
    };
  }
}

/**
 * Expenses API
 */

type ExpenseOrIncomeArgs = {
  month: string;
  year: string;
  userId: User["id"];
  tags?: string[];
};
export async function getAllExpenses({
  userId,
  month,
  year,
  tags = [],
}: ExpenseOrIncomeArgs) {
  try {
    const { data: expenses, error } = await supabaseAdmin
      .from("expenses")
      .select(`*`)
      .order("created_at", { ascending: false })
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year);

    const { expenseCategories } = await getAllExpenseCategories({ userId });

    if (error || !expenses) {
      console.log("getAllExpenses", error);
      return {
        error: error.message,
      };
    }

    let areTagsIncludedInCategories = false;
    (expenseCategories || []).forEach((expenseCategory) => {
      if (tags.includes(expenseCategory.name) && !areTagsIncludedInCategories) {
        areTagsIncludedInCategories = true;
      }
    });

    if (tags.length > 0 && areTagsIncludedInCategories) {
      let filteredExpenses = [] as Array<Expense>;
      expenses.forEach((individualExpense) => {
        const categories = individualExpense.categories
          ? individualExpense.categories.split(",")
          : [];
        let added = false;
        tags.forEach((tag) => {
          if (categories.includes(tag) && !added) {
            filteredExpenses.push(individualExpense);
            added = true;
          }
        });
      });

      return { expenses, filteredExpenses };
    }

    return { expenses, filteredExpenses: [] };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllExpenses ", error);
    return {
      error: "Something went wrong",
    };
  }
}

type InsertExpenseArgs = Pick<
  Expense,
  "title" | "amount" | "day" | "month" | "year" | "categories"
>;
export async function insertExpense({
  expense,
  userId,
}: {
  expense: InsertExpenseArgs;
  userId: User["id"];
}) {
  try {
    const { data: newExpense, error } = await supabaseAdmin
      .from("expenses")
      .insert({
        ...expense,
        user_id: userId,
      })
      .select("*")
      .single();

    if (error || !newExpense) {
      console.log("insertExpense", error);
      return {
        error: error.message,
      };
    }

    return { expense: newExpense };
  } catch (error) {
    // TODO: log error nicely
    console.log("insertExpense", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetExpenseByIdArgs = {
  expenseId: Expense["id"];
  userId: User["id"];
};
export async function getExpenseById({
  expenseId,
  userId,
}: GetExpenseByIdArgs) {
  try {
    const { data: expense, error } = await supabaseAdmin
      .from("expenses")
      .select(`*`)
      .eq("id", expenseId)
      .eq("user_id", userId)
      .single();

    if (error || !expense) {
      console.log("getExpenseById", error);
      return {
        error: error.message,
      };
    }

    return { expense };
  } catch (error) {
    // TODO: log error nicely
    console.log("getExpenseById", error);
    return {
      error: "Something went wrong",
    };
  }
}

type UpdateExpenseArgs = {
  expenseId: Expense["id"];
  userId: User["id"];
  query: Partial<Pick<Expense, "title" | "amount" | "categories">>;
};
export async function updateExpense({
  expenseId,
  userId,
  query,
}: UpdateExpenseArgs) {
  try {
    const { data: expense, error } = await supabaseAdmin
      .from("expenses")
      .update({
        ...query,
      })
      .eq("id", expenseId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !expense) {
      console.log("updateExpense", error);
      return {
        error: error.message,
      };
    }

    return { expense };
  } catch (error) {
    // TODO: log error nicely
    console.log("updateExpense", error);
    return {
      error: "Something went wrong",
    };
  }
}

type DeleteExpenseArgs = {
  expenseId: Expense["id"];
  userId: User["id"];
};
export async function deleteExpense({ expenseId, userId }: DeleteExpenseArgs) {
  try {
    const { error } = await supabaseAdmin
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", userId);

    if (error) {
      console.log("deleteExpense", error);
      return {
        success: false,
      };
    }

    return { success: true };
  } catch (error) {
    // TODO: log error nicely
    console.log("deleteExpense", error);
    return {
      error: "Something went wrong",
    };
  }
}

/**
 * Income API
 */
export async function getAllIncome({
  userId,
  month,
  year,
  tags = [],
}: ExpenseOrIncomeArgs) {
  try {
    const { data: income, error } = await supabaseAdmin
      .from("income")
      .select("*")
      .order("created_at", { ascending: false })
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year);
    const { incomeCategories } = await getAllIncomeCategories({ userId });

    if (error || !income) {
      console.log("getAllIncome", error);
      return {
        error: error.message,
      };
    }

    let areTagsIncludedInCategories = false;

    (incomeCategories || []).forEach((incomeCategory) => {
      if (tags.includes(SEVA_CATEGORY.name) && !areTagsIncludedInCategories) {
        areTagsIncludedInCategories = true;
      } else if (
        tags.includes(incomeCategory.name) &&
        !areTagsIncludedInCategories
      ) {
        areTagsIncludedInCategories = true;
      }
    });

    if (tags.length > 0 && areTagsIncludedInCategories) {
      let filteredIncome = [] as Array<Income>;
      if (tags.includes(SEVA_CATEGORY.name) && tags.length === 1) {
        income.forEach((individualIncome) => {
          let added = false;
          if (individualIncome.seva && !added) {
            filteredIncome.push(individualIncome);
            added = true;
          }
        });
      } else if (tags.includes(SEVA_CATEGORY.name) && tags.length > 1) {
        let incomeWithTenPer = [] as Array<Income>;
        income.forEach((individualIncome) => {
          if (individualIncome.seva) {
            incomeWithTenPer.push(individualIncome);
          }
        });
        incomeWithTenPer.forEach((individualIncome) => {
          const categories = individualIncome.categories
            ? individualIncome.categories.split(",")
            : [];
          let added = false;
          tags.forEach((tag) => {
            if (categories.includes(tag) && !added) {
              filteredIncome.push(individualIncome);
              added = true;
            }
          });
        });
      } else {
        income.forEach((individualIncome) => {
          const categories = individualIncome.categories
            ? individualIncome.categories.split(",")
            : [];
          let added = false;
          tags.forEach((tag) => {
            if (categories.includes(tag) && !added) {
              filteredIncome.push(individualIncome);
              added = true;
            }
          });
        });
      }

      return { income, filteredIncome };
    }

    return {
      income,
      filteredIncome: [],
    };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllIncome", error);
    return {
      error: "Something went wrong",
    };
  }
}

type InsertIncomeArgs = Pick<
  Income,
  "title" | "amount" | "day" | "month" | "year" | "categories" | "seva"
>;
export async function insertIncome({
  income,
  userId,
}: {
  income: InsertIncomeArgs;
  userId: User["id"];
}) {
  try {
    const { data: newIncome, error } = await supabaseAdmin
      .from("income")
      .insert({
        ...income,
        user_id: userId,
      })
      .select("*")
      .single();

    if (error || !newIncome) {
      console.log("insertIncome", error);
      return {
        error: error.message,
      };
    }

    return { income: newIncome };
  } catch (error) {
    // TODO: log error nicely
    console.log("insertIncome", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetIncomeByIdArgs = {
  incomeId: Income["id"];
  userId: User["id"];
};
export async function getIncomeById({ incomeId, userId }: GetIncomeByIdArgs) {
  try {
    const { data: income, error } = await supabaseAdmin
      .from("income")
      .select(`*`)
      .eq("id", incomeId)
      .eq("user_id", userId)
      .single();

    if (error || !income) {
      console.log("getIncomeById", error);
      return {
        error: error.message,
      };
    }

    return { income };
  } catch (error) {
    // TODO: log error nicely
    console.log("getIncomeById", error);
    return {
      error: "Something went wrong",
    };
  }
}

type UpdateIncomeArgs = {
  incomeId: Income["id"];
  userId: User["id"];
  query: Partial<Pick<Income, "title" | "amount" | "categories" | "seva">>;
};
export async function updateIncome({
  incomeId,
  userId,
  query,
}: UpdateIncomeArgs) {
  try {
    const { data: income, error } = await supabaseAdmin
      .from("income")
      .update({
        ...query,
      })
      .eq("id", incomeId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !income) {
      console.log("updateIncome", error);
      return {
        error: error.message,
      };
    }

    return { income };
  } catch (error) {
    // TODO: log error nicely
    console.log("updateIncome", error);
    return {
      error: "Something went wrong",
    };
  }
}

type DeleteIncomeArgs = {
  incomeId: Income["id"];
  userId: User["id"];
};
export async function deleteIncome({ incomeId, userId }: DeleteIncomeArgs) {
  try {
    const { error } = await supabaseAdmin
      .from("income")
      .delete()
      .eq("id", incomeId)
      .eq("user_id", userId);

    if (error) {
      console.log("deleteIncome", error);
      return {
        success: false,
      };
    }

    return { success: true };
  } catch (error) {
    // TODO: log error nicely
    console.log("deleteIncome", error);
    return {
      error: "Something went wrong",
    };
  }
}

/**
 * Categories API
 */
type GetAllCategoriesArgs = {
  userId: User["id"];
};
export async function getAllCategories({ userId }: GetAllCategoriesArgs) {
  try {
    const {
      userCategories: {
        categories: userCategories,
        error: userCategoriesError,
      },
      defaultCategories: {
        categories: defaultCategories,
        error: defaultCategoriesError,
      },
    } = await promiseHash({
      userCategories: getAllUserCategories({ userId }),
      defaultCategories: getAllDefaultCategories(),
    });
    // const { data: categories, error } = await supabaseAdmin
    //   .from("categories")
    //   .select("*")
    //   .in("user_id", ["*", userId]);
    if (userCategoriesError || defaultCategoriesError) {
      console.log("getAllCategories userCategoriesError", userCategoriesError);
      console.log(
        "getAllCategories defaultCategoriesError",
        defaultCategoriesError
      );
      return {
        error: "Something went wrong",
      };
    }
    const categories = [
      ...(userCategories || []),
      ...(defaultCategories || []),
    ];

    console.log("-----------------");
    console.log("getAllCategories", categories.length);
    console.log("-----------------");

    return {
      categories,
    };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetAllExpenseCategoriesArgs = {
  userId: User["id"];
};
export async function getAllExpenseCategories({
  userId,
}: GetAllExpenseCategoriesArgs) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("expense", true)
      .in("user_id", ["*", userId]);
    if (error || !categories) {
      console.log("getAllExpenseCategories", error);
      return {
        error: error.message,
      };
    }

    return {
      expenseCategories: categories,
    };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllExpenseCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetAllUserExpenseCategoriesArgs = {
  userId: User["id"];
};
export async function getAllUserExpenseCategories({
  userId,
}: GetAllUserExpenseCategoriesArgs) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("expense", true)
      .in("user_id", [userId]);
    if (error || !categories) {
      console.log("getAllUserExpenseCategories", error);
      return {
        error: error.message,
      };
    }

    return {
      expenseCategories: categories,
    };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllUserExpenseCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetAllIncomeCategoriesArgs = {
  userId: User["id"];
};
export async function getAllIncomeCategories({
  userId,
}: GetAllIncomeCategoriesArgs) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("expense", false)
      .in("user_id", ["*", userId]);
    if (error || !categories) {
      console.log("getAllIncomeCategories", error);
      return {
        error,
      };
    }

    return {
      incomeCategories: categories,
    };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllIncomeCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetAllUserIncomeCategoriesArgs = {
  userId: User["id"];
};
export async function getAllUserIncomeCategories({
  userId,
}: GetAllUserIncomeCategoriesArgs) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("expense", false)
      .in("user_id", [userId]);
    if (error || !categories) {
      console.log("getAllUserIncomeCategories", error);
      return {
        error,
      };
    }

    return {
      incomeCategories: categories,
    };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllUserIncomeCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

export async function getAllDefaultCategories() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("user_id", "ALL");
    if (error || !categories) {
      console.log("getAllDefaultCategories", error);
      return {
        error: error.message,
      };
    }

    console.log("-----------------");
    console.log("getAllDefaultCategories", categories.length);
    console.log("getAllDefaultCategories Error", error);
    console.log("-----------------");

    return { categories };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllDefaultCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

type GetAllUserCategoriesArgs = {
  userId: User["id"];
};
export async function getAllUserCategories({
  userId,
}: GetAllUserCategoriesArgs) {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("user_id", userId);
    if (error || !categories) {
      console.log("getAllUserCategories", error);
      return {
        error: error.message,
      };
    }

    return { categories };
  } catch (error) {
    // TODO: log error nicely
    console.log("getAllUserCategories", error);
    return {
      error: "Something went wrong",
    };
  }
}

type InsertCategoryArgs = {
  category: Pick<Category, "name" | "expense">;
  userId: User["id"];
};
export async function insertCategory({ userId, category }: InsertCategoryArgs) {
  try {
    const { data: newCategory, error } = await supabaseAdmin
      .from("categories")
      .insert({
        ...category,
        user_id: userId,
      })
      .single();

    if (error || !newCategory) {
      console.log("insertCategory ", error);
      return {
        success: false,
      };
    }

    return { success: true };
  } catch (error) {
    // TODO: log error nicely
    console.log("insertCategory ", error);
    return {
      success: false,
      error: "Something went wrong",
    };
  }
}
